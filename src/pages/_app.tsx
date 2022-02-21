import { AppProps } from "next/app";
import "../styles.css";

const MyApp = ({ pageProps, Component }: AppProps) => {
  return <Component {...pageProps} />;
};

export default MyApp;
