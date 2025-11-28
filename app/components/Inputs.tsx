import { Flex, Text } from "@radix-ui/themes";

export function InputErrors(props: { errors?: string[] }) {
  if (Array.isArray(props.errors) && props.errors.length > 0) {
    return (
      <Text color="red" size="1" weight="light">
        {props.errors.join(", ")}
      </Text>
    );
  }
  return null;
}

export function InputLabel(props: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <Text as="label" size="2" htmlFor={props.htmlFor}>
      {props.children}
    </Text>
  );
}

export function InputContainer(props: { children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="2">
      {props.children}
    </Flex>
  );
}
