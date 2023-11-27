export type SocialIcons = 'telegram' | 'twitter' | 'meta' | 'discord'

export interface SocialProps {
  icons?: SocialIcons[];
  className: string;
}
