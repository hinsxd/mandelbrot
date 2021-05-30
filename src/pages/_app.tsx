import { AppProps } from "next/app";
import "../styles.scss";

const MyApp = ({ pageProps, Component }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;
