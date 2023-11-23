export const getUrl = (
  props: { roomName: string; domainUrl: string; connectPassword: string; deletePassword: string },
): string => {
  const {
    roomName, domainUrl, connectPassword, deletePassword,
  } = props || {};
  // eslint-disable-next-line max-len
  return `Below are admin credentials for chat room “${roomName}”.\nPlease do not share the Passphrase to Delete with others: they will be able to destroy the chat room and all conversations.\n\nChat URL:\n${domainUrl}\n\nPassword to Join:\n${connectPassword}\n\nPassphrase to Delete:\n${deletePassword}`;
};