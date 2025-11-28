import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Button, Flex, IconButton, TextField } from "@radix-ui/themes";
import { useState } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  type ActionFunctionArgs,
} from "react-router";
import { z } from "zod";
import { InputContainer, InputErrors, InputLabel } from "~/components/Inputs";
import { SitesHeading } from "~/components/Sites";

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

  return redirect(`/account/${submission.value.id}/mails`);
}

function AddAccount() {
  const actionData = useActionData<typeof action>();

  const [showPassword, setShowPassword] = useState(false);
  const handleToggleShowPassword = () => {
    setShowPassword((previous) => {
      return !previous;
    });
  };

  const [form, fields] = useForm({
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    lastResult: actionData,
  });

  return (
    <>
      <SitesHeading>Add Account</SitesHeading>
      <Flex asChild direction="column" gap="4">
        <Form method="post" {...getFormProps(form)}>
          <InputContainer>
            <InputLabel htmlFor={fields.email.id}>Email</InputLabel>
            <TextField.Root
              {...getInputProps(fields.email, { type: "email" })}
              size="3"
              placeholder="Enter your email address..."
            />
            <InputErrors errors={fields.email.errors} />
          </InputContainer>
          <InputContainer>
            <InputLabel htmlFor={fields.password.id}>Password</InputLabel>
            <TextField.Root
              {...getInputProps(fields.password, {
                type: showPassword ? "text" : "password",
              })}
              size="3"
              placeholder="Enter your password..."
            >
              <TextField.Slot side="right">
                <IconButton variant="ghost" onClick={handleToggleShowPassword}>
                  {showPassword === false ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </IconButton>
              </TextField.Slot>
            </TextField.Root>
            <InputErrors errors={fields.password.errors} />
          </InputContainer>
          <InputContainer>
            <InputLabel htmlFor={fields.host.id}>Host</InputLabel>
            <TextField.Root
              {...getInputProps(fields.host, { type: "text" })}
              size="3"
              placeholder="Enter your host..."
            />
            <InputErrors errors={fields.host.errors} />
          </InputContainer>
          <InputContainer>
            <InputLabel htmlFor={fields.port.id}>Port</InputLabel>
            <TextField.Root
              {...getInputProps(fields.port, { type: "number" })}
              size="3"
              placeholder="Enter your port..."
            />
            <InputErrors errors={fields.port.errors} />
          </InputContainer>
          <Flex gap="2" mt="4" direction="column">
            <Button type="submit" size="3">
              Submit
            </Button>
            <Button size="3" variant="outline" asChild>
              <Link to="/">Cancel</Link>
            </Button>
          </Flex>
          <InputErrors errors={form.errors} />
        </Form>
      </Flex>
    </>
  );
}

export default AddAccount;
