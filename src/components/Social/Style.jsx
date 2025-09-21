import styled, { css } from "styled-components";

export const SocialsContainer = styled.div``;

export const SocialButton = styled.button`
  border: none;
  outline: none;
  border-radius: 8px;
  cursor: pointer;
  -webkit-transition: ${(props) => props.theme.transition};
  -o-transition: ${(props) => props.theme.transition};
  transition: ${(props) => props.theme.transition};
  color: ${(props) => props.theme.colors.white};
  font-size: 24px;
  height: 3rem;
  width: 3rem;
  position: relative;

  &:hover {
    -webkit-transform: translateY(-4px) scale(1.1);
    -ms-transform: translateY(-4px) scale(1.1);
    transform: translateY(-4px) scale(1.1);
    -webkit-box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15);
  }

  &:focus {
    -webkit-transform: scale(0.98);
    -ms-transform: scale(0.98);
    transform: scale(0.98);
  }

  i {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    color: inherit;

    @media only screen and (max-width: ${(props) =>
        props.theme.queries.mobile}) {
      position: absolute;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      -ms-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
    }
  }

  ${(props) =>
    props.social === "linkedin" &&
    css`
      background: #0077b5;
      color: white;

      &:hover {
        background: darken(#0077b5, 10%);
        color: white;
      }
    `}

  ${(props) =>
    props.social === "github" &&
    css`
      background: #24292e;
      color: white;

      &:hover {
        background: #000000;
        color: white;
      }
    `}

${(props) =>
    props.social === "facebook" &&
    css`
      background: #1877f2;
      color: white;

      &:hover {
        background: #0d65d9;
        color: white;
      }
    `}


    ${(props) =>
    props.margin &&
    css`
      margin-left: ${props.margin}rem;
      margin-right: ${props.margin}rem;
    `}
`;
