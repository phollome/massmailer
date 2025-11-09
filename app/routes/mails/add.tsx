import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import {
  Button,
  Container,
  Flex,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  Form,
  redirect,
  useActionData,
  type ActionFunctionArgs,
} from "react-router";
import { z } from "zod";
import prisma from "~/db.server";

const schema = z.object({
  subject: z
    .string({ message: "Subject is required" })
    .min(1, { message: "Subject is required" }),
  body: z
    .string({ message: "Body is required" })
    .min(1, { message: "Body is required" }),
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
        await prisma.mail.create({
          data: {
            subject: data.subject,
            body: data.body,
          },
        });
      } catch (error) {
        console.error(error);
        context.addIssue({
          code: "custom",
          message: "Failed to create mail",
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

function AddMail() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate: function (args: { formData: FormData }) {
      const { formData } = args;
      return parseWithZod(formData, { schema });
    },
    lastResult: actionData,
  });

  return (
    <Container size="2">
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

export default AddMail;
