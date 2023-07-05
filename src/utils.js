import { dirname } from "path";
import { fileURLToPath } from "url";
export const __dirname = dirname(fileURLToPath(import.meta.url));

const isNumberValid = (number) =>
  (typeof number === "number" && number > 0) ||
  (typeof number === "string" && number.trim() !== "" && !isNaN(number));

export const areProductFieldsValid = ({
  title,
  description,
  price,
  category,
  code,
  stock,
}) => {
  if (typeof title !== "string" || !title) return false;
  if (typeof description !== "string" || !description) return false;
  if (typeof code !== "string" || !code) return false;
  if (typeof category !== "string" || !category) return false;
  if (!isNumberValid(price)) return false;
  if (!isNumberValid(stock)) return false;

  return true;
};
