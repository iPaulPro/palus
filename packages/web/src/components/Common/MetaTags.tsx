import { Helmet } from "react-helmet-async";

interface MetaTagsProps {
  title?: string;
  description?: string;
}

const MetaTags = ({
  title = "Palus",
  description = "Palus is an open-source Web3 social media platform built on Lens"
}: MetaTagsProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta content={description} name="description" />}
    </Helmet>
  );
};

export default MetaTags;
