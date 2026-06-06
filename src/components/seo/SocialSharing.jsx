import React from "react";
import { useTranslation } from "react-i18next";
import "@/components/seo/SocialSharing.scss";

export default function SocialSharing() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  const getShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", currentLang);
    return encodeURIComponent(url.toString());
  };

  const shareOnFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${getShareUrl()}`;
    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer,width=600,height=400,resizable=yes,scrollbars=yes,status=yes"
    );
  };

  const tweetOnExTwitter = () => {
    const text = encodeURIComponent(t("footer.socialSharing.tweetText"));
    const shareUrl = `https://x.com/intent/tweet?text=${text}&url=${getShareUrl()}`;
    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer,width=600,height=400,resizable=yes,scrollbars=yes,status=yes"
    );
  };

  const shareOnLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${getShareUrl()}`;
    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer,width=600,height=400,resizable=yes,scrollbars=yes,status=yes"
    );
  };

  const shareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", currentLang);
    const decodedUrl = decodeURIComponent(url.toString());

    navigator.clipboard
      .writeText(decodedUrl)
      .then(() => {
        console.log("Link copied to clipboard");
      })
      .catch((error) => {
        console.error("Error copying link to clipboard:", error);
      });
  };

  return (
    <div className="social-sharing">
      <i
        className="fab fa-facebook"
        onClick={shareOnFacebook}
        title={t("footer.socialSharing.shareOnFacebook")}
      ></i>
      <i
        className="fab fa-x-twitter"
        onClick={tweetOnExTwitter}
        title={t("footer.socialSharing.tweetOnExTwitter")}
      ></i>
      <i
        className="fab fa-linkedin"
        onClick={shareOnLinkedIn}
        title={t("footer.socialSharing.shareOnLinkedIn")}
      ></i>
      <i
        className="fas fa-link"
        onClick={shareLink}
        title={t("footer.socialSharing.shareLink")}
      ></i>
    </div>
  );
}
