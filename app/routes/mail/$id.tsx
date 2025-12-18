import {
  getCollectionProps,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { invariantResponse } from "@epic-web/invariant";
import {
  Button,
  Checkbox,
  Flex,
  Link as LinkStyle,
  Spinner,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import { useHydrated } from "remix-utils/use-hydrated";
import { z } from "zod";
import prisma from "~/db.server";

const schema = z.object({
  subject: z
    .string({ message: "Subject is required" })
    .min(1, { message: "Subject is required" }),
  body: z
    .string({ message: "Body is required" })
    .min(1, { message: "Body is required" }),
  // Handle multi select issue where single selection comes as string instead of array
  recipients: z.preprocess((value) => {
    if (typeof value === "string") {
      return [value];
    }
    return value;
  }, z.array(z.string())),
});

const IntentKey = "intent";

const Intents = {
  Update: "update",
  Process: "process",
};

export async function loader(args: LoaderFunctionArgs) {
  const { params } = args;
  const { id } = params;

  const mail = await prisma.mail.findFirst({
    where: { id },
    include: {
      recipients: {
        select: {
          contact: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  invariantResponse(mail !== null, "Mail not found", {
    status: 404,
  });

  const contacts = await prisma.contact.findMany({
    where: { accountId: mail.accountId },
  });

  return { mail, contacts, ts: Date.now() };
}

export async function action(args: LoaderFunctionArgs) {
  const { request, params } = args;

  const { id } = params;

  invariantResponse(id, "Mail ID is required", { status: 400 });

  const formData = await request.formData();

  const intent = formData.get(IntentKey);

  invariantResponse(
    intent === Intents.Update || intent === Intents.Process,
    "Invalid intent",
    { status: 400 },
  );

  const submission = await parseWithZod(formData, {
    schema: schema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (intent === Intents.Update) {
    try {
      const mail = await prisma.mail.update({
        where: { id },
        data: {
          subject: submission.value.subject,
          body: submission.value.body,
          recipients: {
            deleteMany: {},
            create: submission.value.recipients.map((contactId) => {
              return { contactId };
            }),
          },
        },
      });
      // TODO: Add success flash message
      return redirect(`/mail/${mail.id}`);
    } catch (error) {
      // TODO: Add error flash message
      throw new Response("Failed to update mail", { status: 500 });
    }
  } else if (intent === Intents.Process) {
    try {
      const mail = await prisma.mail.update({
        where: { id },
        data: {
          process: true,
        },
      });
      // TODO: Add success flash message
      return redirect(`/mail/${mail.id}`);
    } catch (error) {
      // TODO: Add error flash message
      throw new Response("Failed to process mail", { status: 500 });
    }
  }

  // TODO: Add flash message for unknown intent
  return redirect(`/mail/${id}`);
}

function Mail() {
  const loaderData = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: `mail-edit-form-${loaderData.ts}`,
    constraint: getZodConstraint(schema),
    defaultValue: {
      subject: loaderData.mail.subject,
      body: loaderData.mail.body,
    },
    onValidate: (context) => {
      const submission = parseWithZod(context.formData, { schema });
      return submission;
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    lastResult: actionData,
  });

  // Check js available
  const isHydrated = useHydrated();

  // Track dirty state
  const [dirty, setDirty] = useState(false);
  const handleFormChange = () => {
    setDirty(true);
  };

  // Reset dirty state when loaderData.ts changes (i.e., after successful update)
  useEffect(() => {
    setDirty(false);
  }, [loaderData.ts]);

  const readOnly = loaderData.mail.complete || loaderData.mail.process;

  return (
    <>
      <Text as="p" size="1" align="right">
        <LinkStyle asChild>
          <Link to={`/account/${loaderData.mail.accountId}/mails`}>
            Back to account
          </Link>
        </LinkStyle>
      </Text>
      <Form method="post" {...getFormProps(form)} onChange={handleFormChange}>
        <Flex gap="2" direction="column">
          <Text as="label" size="2" weight="bold" htmlFor={fields.subject.id}>
            Subject
          </Text>
          <TextField.Root
            {...getInputProps(fields.subject, { type: "text" })}
            disabled={readOnly}
          />
          {Array.isArray(fields.subject.errors) &&
            fields.subject.errors.length > 0 && (
              <Text color="red" size="1">
                {fields.subject.errors}
              </Text>
            )}
          <Text as="label" size="2" weight="bold" htmlFor={fields.body.id}>
            Body
          </Text>
          <TextArea {...getTextareaProps(fields.body)} disabled={readOnly} />
          {Array.isArray(fields.body.errors) &&
            fields.body.errors.length > 0 && (
              <Text color="red" size="1">
                {fields.body.errors}
              </Text>
            )}
          {getCollectionProps(fields.recipients, {
            type: "checkbox",
            options: loaderData.contacts.map((contact) => {
              return contact.id;
            }),
          }).map((props) => {
            const { key, type, ...otherProps } = props;

            const contact = loaderData.contacts.find((contact) => {
              return contact.id === props.value;
            });

            if (typeof contact === "undefined") {
              return null;
            }

            const checked = loaderData.mail.recipients.some((recipient) => {
              return recipient.contact.id === contact.id;
            });

            return (
              <Text key={key} as="label" size="2">
                <Flex gap="2" align="center">
                  {
                    // Use Checkbox component if js is available
                    isHydrated ? (
                      <Checkbox
                        {...otherProps}
                        defaultChecked={checked}
                        size="1"
                        disabled={readOnly}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        {...otherProps}
                        defaultChecked={checked}
                        disabled={readOnly}
                      />
                    )
                  }
                  <Text as="div">{contact.email}</Text>
                </Flex>
              </Text>
            );
          })}
          <Button
            type="submit"
            name={IntentKey}
            value={Intents.Update}
            data-testid="mail-update-button"
            // Only handle disable state if js is available
            disabled={
              (isHydrated ? dirty === false || form.valid === false : false) ||
              readOnly
            }
          >
            Update
          </Button>
          <Button
            type="submit"
            color="green"
            name={IntentKey}
            value={Intents.Process}
            data-testid="mail-process-button"
            // Only handle disable state if js is available
            disabled={
              (isHydrated && dirty) ||
              loaderData.mail.recipients.length === 0 ||
              readOnly
            }
          >
            Process
            <Spinner loading={loaderData.mail.process}></Spinner>
          </Button>
          {Array.isArray(form.errors) && form.errors.length > 0 && (
            <Text color="red" size="1">
              {form.errors}
            </Text>
          )}
        </Flex>
      </Form>
    </>
  );
}

export default Mail;
