import {
  rand,
  randDomainSuffix,
  randEmail,
  randEmailProvider,
  randPassword,
  randUuid,
} from "@ngneat/falso";

export function getRandomAccount() {
  const provider = randEmailProvider();
  const domainSuffix = randDomainSuffix();

  const account = {
    id: randUuid(),
    email: randEmail({ provider, suffix: domainSuffix }),
    password: randPassword(),
    host: `smtp.${provider}.${domainSuffix}`,
    port: rand([25, 465, 587]),
  };
  return account;
}
