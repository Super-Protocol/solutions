export const getUrl = (props: { roomName: string; domainUrl: string; connectPassword: string; }): string => {
  const { roomName, domainUrl, connectPassword } = props || {};
  // eslint-disable-next-line max-len
  return `You are invited to join confidential chat room “${roomName}”.\nPlease follow the URL below and enter the Password to Join.\n\nChat URL:\n${domainUrl}\n\nPassword to Join:\n${connectPassword}`;
};