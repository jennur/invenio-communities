import { i18next } from "@translations/invenio_communities/i18next";

export const memberVisibilityTypes = {
  public: {
    visible: true,
    title: i18next.t("Public"),
    description: i18next.t(
      "Member publicly visible in the community members list"
    ),
  },
  hidden: {
    visible: false,
    title: i18next.t("Hidden"),
    description: i18next.t("Member hidden in the community members list"),
  },
};
