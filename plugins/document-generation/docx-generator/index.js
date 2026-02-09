#!/usr/bin/env node

import { createInterface } from 'readline';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { writeFileSync } from 'fs';

// JSON-RPC server over stdio
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

/**
 * Generate a simple DOCX document
 */
async function handleGenerateSimple(params) {
  const { title, body, outputPath } = params;

  if (!title || !body || !outputPath) {
    throw new Error('title, body, and outputPath are required');
  }

  try {
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),
          // Body paragraphs
          ...body.split('\n\n').map(para =>
            new Paragraph({
              children: [
                new TextRun({
                  text: para.trim(),
                  size: 24, // 12pt font
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          ),
        ],
      }],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Write to file
    writeFileSync(outputPath, buffer);

    return {
      success: true,
      outputPath,
      size: buffer.length,
    };
  } catch (error) {
    throw new Error(`Failed to generate document: ${error.message}`);
  }
}

/**
 * Generate a structured DOCX document
 */
async function handleGenerate(params) {
  const { content, outputPath } = params;

  if (!content || !outputPath) {
    throw new Error('content and outputPath are required');
  }

  try {
    const { title, sections } = content;

    if (!title || !sections || !Array.isArray(sections)) {
      throw new Error('content must have title and sections array');
    }

    // Build document sections
    const children = [
      // Document title
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
        },
      }),
    ];

    // Add each section
    for (const section of sections) {
      // Section heading
      if (section.heading) {
        children.push(
          new Paragraph({
            text: section.heading,
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 300,
              after: 200,
            },
          })
        );
      }

      // Section content
      if (section.content) {
        const paragraphs = Array.isArray(section.content)
          ? section.content
          : [section.content];

        for (const para of paragraphs) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para,
                  size: 24,
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          );
        }
      }

      // Bullet points
      if (section.bullets && Array.isArray(section.bullets)) {
        for (const bullet of section.bullets) {
          children.push(
            new Paragraph({
              text: bullet,
              bullet: {
                level: 0,
              },
              spacing: {
                after: 100,
              },
            })
          );
        }
      }
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Write to file
    writeFileSync(outputPath, buffer);

    return {
      success: true,
      outputPath,
      size: buffer.length,
      sectionCount: sections.length,
    };
  } catch (error) {
    throw new Error(`Failed to generate document: ${error.message}`);
  }
}

// Method handlers
const methods = {
  generateSimple: handleGenerateSimple,
  generate: handleGenerate,
};

// Process JSON-RPC requests
rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    const { jsonrpc, method, params, id } = request;

    if (jsonrpc !== '2.0') {
      throw new Error('Invalid JSON-RPC version');
    }

    if (!methods[method]) {
      throw new Error(`Unknown method: ${method}`);
    }

    const result = await methods[method](params || {});

    const response = {
      jsonrpc: '2.0',
      result,
      id
    };

    console.log(JSON.stringify(response));
  } catch (error) {
    const response = {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error.message
      },
      id: null
    };

    console.log(JSON.stringify(response));
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Signal ready
console.error('DOCX Generator plugin started');
