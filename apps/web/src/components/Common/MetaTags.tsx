import { Helmet } from "react-helmet-async";

interface MetaTagsProps {
  title?: string;
  description?: string;
}

const MetaTags = ({
  title = "Palus",
  description = "Palus is a social network for the open web"
}: MetaTagsProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta content={description} name="description" />}
    </Helmet>
  );
};

export default MetaTags;
