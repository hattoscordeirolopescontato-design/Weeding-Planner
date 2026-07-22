import { z } from "zod";

// Estado retornado pelas Server Actions de formulário (usado com useActionState).
export type FormState =
  | { errors?: Record<string, string>; ok?: boolean; message?: string }
  | undefined;

// Converte "" / null em undefined antes de coagir para número.
const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative("Valor inválido").optional(),
);

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().nonnegative("Valor inválido").optional(),
);

const optionalString = z.preprocess(
  (v) => (v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? undefined : v),
  z.string().optional(),
);

/** Valida o dígito verificador do CPF (recebe só dígitos, 11 caracteres). */
export function isValidCPF(digits: string): boolean {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return check(9) === Number(digits[9]) && check(10) === Number(digits[10]);
}

const cpfField = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine(isValidCPF, "CPF inválido");

export const cadastroSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: cpfField,
});

export const verificarCpfSchema = z.object({
  cpf: cpfField,
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome"),
    email: z.email("E-mail inválido"),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const weddingSchema = z.object({
  title: z.string().min(2, "Informe um título"),
  date: optionalString,
  budget: optionalNumber,
});

export const vendorSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  category: z.string().min(1, "Informe a categoria"),
  contact: optionalString,
  price: optionalNumber,
  status: z.enum(["cotacao", "contratado", "pago", "cancelado"]),
  notes: optionalString,
});

export const venueSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  address: optionalString,
  capacity: optionalInt,
  price: optionalNumber,
  isSelected: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  notes: optionalString,
});

export const guestSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: optionalString,
  phone: optionalString,
  groupName: optionalString,
  rsvp: z.enum(["pendente", "confirmado", "recusado"]),
  plusOnes: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce.number().int().min(0),
  ),
  notes: optionalString,
});

export const vowSchema = z.object({
  title: z.string().min(1, "Informe um título"),
  content: z.string().min(1, "Escreva seus votos"),
  password: z.string().min(4, "A senha deve ter ao menos 4 caracteres"),
});

export const vowUnlockSchema = z.object({
  password: z.string().min(1, "Informe a senha"),
});

export const checkoutSchema = z.object({
  cardToken: z.string().min(1, "Token do cartão ausente"),
  buyerName: z.string().min(2, "Informe o nome completo"),
  buyerEmail: z.email("E-mail inválido"),
  buyerDocument: z.string().min(11, "CPF inválido"),
  buyerPhone: z.string().min(10, "Telefone inválido"),
  zipCode: z.string().min(8, "CEP inválido"),
  address: z.string().min(1, "Informe o endereço"),
  number: z.string().min(1, "Informe o número"),
  complement: optionalString,
  neighborhood: optionalString,
  city: z.string().min(1, "Informe a cidade"),
  state: z.string().length(2, "UF inválida"),
  couponCode: optionalString,
});

/** Extrai um mapa { campo: mensagem } a partir de um ZodError. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
