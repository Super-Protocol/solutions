import { Poppins } from '@next/font/google';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'block',
});

export const Fonts = () => {
  return (
    <style jsx global>{`
        html, body, .popover-body {
          font-family: ${poppins.style.fontFamily}, sans-serif;
        }
      `}
    </style>
  );
};

export default Fonts;
