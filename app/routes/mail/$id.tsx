import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type LoaderFunctionArgs,
} from "react-router";
import { invariantResponse } from "@epic-web/invariant";
import prisma from "~/db.server";
import {
  Button,
  Flex,
  Link as LinkStyle,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { useHydrated } from "remix-utils/use-hydrated";

const schema = z.object({
  subject: z
    .string({ message: "Subject is required" })
    .min(1, { message: "Subject is required" }),
  body: z
    .string({ message: "Body is required" })
    .min(1, { message: "Body is required" }),
});

export async function loader(args: LoaderFunctionArgs) {
  const { params } = args;
  const { id } = params;

  const mail = await prisma.mail.findFirst({
    where: { id },
  });

  invariantResponse(mail !== null, "Mail not found", {
    status: 404,
  });

  return { mail, ts: Date.now() };
}

export async function action(args: LoaderFunctionArgs) {
  const { request, params } = args;

  const { id } = params;

  invariantResponse(id, "Mail ID is required", { status: 400 });

  const formData = await request.formData();

  const intent = formData.get("intent");

  invariantResponse(intent === "update", "Invalid intent", { status: 400 });

  const submission = await parseWithZod(formData, {
    schema: schema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (intent === "update") {
    try {
      const mail = await prisma.mail.update({
        where: { id },
        data: {
          subject: submission.value.subject,
          body: submission.value.body,
        },
      });
      // TODO: Add success flash message
      return redirect(`/mail/${mail.id}`);
    } catch (error) {
      // TODO: Add error flash message
      throw new Response("Failed to update mail", { status: 500 });
    }
  }
}

function Mail() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isHydrated = useHydrated();
  const [form, fields] = useForm({
    id: `mail-edit-form-${loaderData.ts}`,
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

  return (
    <>
      <Text as="p" size="1" align="right">
        <LinkStyle asChild>
          <Link to={`/account/${loaderData.mail.accountId}/mails`}>
            Back to account
          </Link>
        </LinkStyle>
      </Text>
      <Form method="post" {...getFormProps(form)}>
        <Flex gap="2" direction="column">
          <Text as="label" size="2" weight="bold" htmlFor={fields.subject.id}>
            Subject
          </Text>
          <TextField.Root
            {...getInputProps(fields.subject, { type: "text" })}
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
          <TextArea {...getTextareaProps(fields.body)} />
          {Array.isArray(fields.body.errors) &&
            fields.body.errors.length > 0 && (
              <Text color="red" size="1">
                {fields.body.errors}
              </Text>
            )}
          <Button
            type="submit"
            name="intent"
            value="update"
            disabled={
              isHydrated ? form.dirty === false || form.valid === false : false
            }
          >
            Update
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
