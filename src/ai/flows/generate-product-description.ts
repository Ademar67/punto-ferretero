'use server';
/**
 * @fileOverview Un agente de IA que genera descripciones de productos para una ferretería.
 *
 * - generateProductDescription - Una función que maneja el proceso de generación de descripción de producto.
 * - GenerateProductDescriptionInput - El tipo de entrada para la función generateProductDescription.
 * - GenerateProductDescriptionOutput - El tipo de retorno para la función generateProductDescription.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('El nombre del producto.'),
  category: z.string().describe('La categoría a la que pertenece el producto (ej. "tornillería", "herramienta").'),
  brand: z.string().optional().describe('La marca del producto (opcional).'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('La descripción generada del producto.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `Actúa como un experto en marketing y ventas para una ferretería. Tu objetivo es crear descripciones de productos detalladas, atractivas y persuasivas que incentiven la compra.

Genera una descripción de producto para el siguiente artículo, considerando su nombre, categoría y marca (si se proporciona).

Nombre del Producto: {{{productName}}}
Categoría: {{{category}}}
{{#if brand}}Marca: {{{brand}}}{{/if}}

La descripción debe ser concisa, destacar los beneficios clave, las características importantes y el uso principal del producto. No uses prefijos o sufijos como "Aquí tienes la descripción:" o "Espero que esto ayude.". Simplemente proporciona la descripción del producto directamente.`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
