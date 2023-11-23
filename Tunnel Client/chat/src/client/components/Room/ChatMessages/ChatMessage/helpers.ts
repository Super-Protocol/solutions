export const linkify = (str: string) => {
  const regex = /(^|\s)(https?:\/\/\S+)/ig;
  return str.replace(regex, '$1<a href="$2" target="_blank">$2</a>');
};

export const options = {
  whiteList: {
    a: ['href', 'title', 'target'],
  },
};