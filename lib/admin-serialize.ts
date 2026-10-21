import { decrypt } from "@/lib/crypto";
import { audienceOf, type Participant } from "@/lib/types";

export function serializeParticipant(item: Participant) {
  return {
    id: item.id,
    status: item.status,
    inviteCode: item.inviteCode,
    audience: audienceOf(item.audience),
    createdAt: item.createdAt,
    identity: item.identity ?? null,
    cnic: item.cnicEnc ? decrypt(item.cnicEnc) : null,
    consents: item.consents ?? null,
    audit: item.audit ?? null,
    tempPassword: item.tempPasswordEnc ? decrypt(item.tempPasswordEnc) : null,
    credentialsEmailed: !!item.credentialsEmailed,
    appUserId: item.appUserId ?? null,
    firstSignInAt: item.firstSignInAt ?? null,
    pulses: item.pulses || [],
    bugs: item.bugs || [],
    questionnaires: item.questionnaires || [],
    join: item.join ?? null,
    logs: item.logs || [],
  };
}

export type AdminParticipant = ReturnType<typeof serializeParticipant>;
