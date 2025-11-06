import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Button, Container, Flex, Text, TextField } from "@radix-ui/themes";
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
});

export async function loader() {
  return null;
}

export async function action(args: ActionFunctionArgs) {
  const { request } = args;
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: schema.transform(async (data, context) => {
      try {
        await prisma.contact.create({
          data: {
            email: data.email,
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

  return redirect("/");
}

function AddContacts() {
  const actionData = useActionData();

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

export default AddContacts;
