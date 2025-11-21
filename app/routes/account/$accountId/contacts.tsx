import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { invariantResponse } from "@epic-web/invariant";
import {
  Button,
  Container,
  DataList,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { z } from "zod";
import prisma from "~/db.server";

const schema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

export async function loader(args: LoaderFunctionArgs) {
  const { params } = args;
  const { accountId } = params;

  invariantResponse(accountId, "Account ID is required", { status: 400 });

  const contacts = await prisma.contact.findMany({
    where: { accountId },
    select: {
      id: true,
      email: true,
    },
  });

  return { contacts };
}

export async function action(args: ActionFunctionArgs) {
  const { request, params } = args;

  const accountId = params.accountId;

  invariantResponse(accountId, "Account ID is required", { status: 400 });

  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: schema.transform(async (data, context) => {
      try {
        await prisma.contact.create({
          data: {
            email: data.email,
            accountId: accountId,
          },
        });
      } catch (error) {
        context.addIssue({
          code: "custom",
          message: "Failed to create contact",
        });
        return z.NEVER;
      }
      return data;
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  return redirect("./");
}

function Contacts() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    lastResult: actionData,
  });

  return (
    <>
      <Heading as="h1" size="4" weight="bold">
        Contacts
      </Heading>
      <Container size="2">
        <Form method="post" {...getFormProps(form)}>
          <Flex gap="2" direction="column">
            <Text as="label" size="2" weight="bold" htmlFor={fields.email.id}>
              Email
            </Text>
            <TextField.Root
              {...getInputProps(fields.email, { type: "email" })}
            />
            {Array.isArray(fields.email.errors) &&
              fields.email.errors.length > 0 && (
                <Text color="red" size="1">
                  {fields.email.errors}
                </Text>
              )}
            <Button type="submit">Add Contact</Button>
            {Array.isArray(form.errors) && form.errors.length > 0 && (
              <Text color="red" size="1">
                {form.errors}
              </Text>
            )}
          </Flex>
        </Form>
      </Container>
      {loaderData.contacts.length > 0 ? (
        <DataList.Root orientation="horizontal">
          {loaderData.contacts.map((contact) => (
            <DataList.Item key={contact.id}>
              <DataList.Label>Email</DataList.Label>
              <Text>{contact.email}</Text>
            </DataList.Item>
          ))}
        </DataList.Root>
      ) : (
        <Text>No contacts found.</Text>
      )}
    </>
  );
}

export default Contacts;
