import { Heading } from "@radix-ui/themes";

export function SitesHeading(props: { children: React.ReactNode }) {
  return (
    <Heading size="6" align="center" weight="light" as="h1" mb="4">
      {props.children}
    </Heading>
  );
}
