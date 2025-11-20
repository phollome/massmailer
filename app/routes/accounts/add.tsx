import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Button, TextField, Text, Flex, Container } from "@radix-ui/themes";
import {
  Form,
  redirect,
  useActionData,
  type ActionFunctionArgs,
} from "react-router";
import { z } from "zod";
import prisma from "~/db.server";

const schema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" }),
  host: z
    .string({ message: "Invalid host" })
    .regex(/^[a-zA-Z0-9.-]+$/, { message: "Invalid host" }),
  port: z
    .number({ message: "Invalid port" })
    .min(1)
    .max(65535, { message: "Invalid port (1-65535)" }),
});

export async function loader() {
  return null;
}

export async function action(args: ActionFunctionArgs) {
  const { request } = args;
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: schema.transform(async (data, context) => {
      let id: string;
      try {
        const account = await prisma.account.create({
          data: {
            email: data.email,
            password: data.password,
            host: data.host,
            port: data.port,
          },
        });
        id = account.id;
      } catch (error) {
        context.addIssue({
          code: "custom",
          message: "Failed to create email account",
        });
        return z.NEVER;
      }
      return { ...data, id };
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  return redirect(`/account/${submission.value.id}`);
}

function AddAccount() {
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
    <Container size="2">
      <Form method="post" {...getFormProps(form)}>
        <Flex gap="2" direction="column">
          <Text as="label" size="2" weight="bold" htmlFor={fields.email.id}>
            Email
          </Text>
          <TextField.Root {...getInputProps(fields.email, { type: "email" })} />
          {Array.isArray(fields.email.errors) &&
            fields.email.errors.length > 0 && (
              <Text color="red" size="1">
                {fields.email.errors}
              </Text>
            )}
          <Text as="label" size="2" weight="bold" htmlFor={fields.password.id}>
            Password
          </Text>
          <TextField.Root
            {...getInputProps(fields.password, { type: "password" })}
          />
          {Array.isArray(fields.password.errors) &&
            fields.password.errors.length > 0 && (
              <Text color="red" size="1">
                {fields.password.errors}
              </Text>
            )}
          <Text as="label" size="2" weight="bold" htmlFor={fields.host.id}>
            Host
          </Text>
          <TextField.Root {...getInputProps(fields.host, { type: "text" })} />
          {Array.isArray(fields.host.errors) &&
            fields.host.errors.length > 0 && (
              <Text color="red" size="1">
                {fields.host.errors}
              </Text>
            )}
          <Text as="label" size="2" weight="bold" htmlFor={fields.port.id}>
            Port
          </Text>
          <TextField.Root {...getInputProps(fields.port, { type: "number" })} />
          {Array.isArray(fields.port.errors) &&
            fields.port.errors.length > 0 && (
              <Text color="red" size="1">
                {fields.port.errors}
              </Text>
            )}
          <Button type="submit">Submit</Button>
          {Array.isArray(form.errors) && form.errors.length > 0 && (
            <Text color="red" size="1">
              {form.errors}
            </Text>
          )}
        </Flex>
      </Form>
    </Container>
  );
}

export default AddAccount;
