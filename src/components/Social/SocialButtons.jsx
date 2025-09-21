import React from "react";
import { motion } from "framer-motion";
import SocialButton from "../Social/SocialButton";
import Data from "../../Data";

const SocialButtons = () => {
  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
    >
      <SocialButton
        social="linkedin"
        icon="linkedin-in"
        link={`https://www.linkedin.com/in/${Data.social.linkedin}`}
      />
      <SocialButton
        social="github"
        icon="github"
        link={`https://github.com/${Data.social.github}`}
        margin={1}
      />
      <SocialButton
        social="facebook"
        icon="facebook-f"
        link={`https://www.facebook.com/${Data.social.facebook}`}
      />
    </motion.div>
  );
};

export default SocialButtons;
