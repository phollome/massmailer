import {
  rand,
  randDomainSuffix,
  randEmail,
  randEmailProvider,
  randPassword,
  randText,
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

export function getRandomMail() {
  const mail = {
    id: randUuid(),
    subject: randText({ charCount: 10 }),
    body: randText({ charCount: 100 }),
  };
  return mail;
}
