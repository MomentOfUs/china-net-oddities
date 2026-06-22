import { defineCollection, z } from 'astro:content';

const phenomenon = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.any(),
    english_name: z.any().optional().nullable(),
    subtitle: z.any().optional().nullable(),
    avatar: z.any().optional().nullable(),
    hero: z.any().optional().nullable(),
    hero_tag: z.any().optional().nullable(),
    hero_type: z.any().optional().nullable(),
    ribbon: z.array(z.object({
      label: z.any().optional().nullable(),
      num: z.any().optional().nullable(),
      note: z.any().optional().nullable(),
      color: z.any().optional().nullable(),
    })).optional().default([]),
    main_stat: z.object({
      big_number: z.any(),
      big_unit: z.any().optional().nullable(),
      big_desc: z.any().optional().nullable(),
      big_sublabel: z.any().optional().nullable(),
      bio: z.array(z.any()).optional().default([]),
    }),
    data_grid: z.array(z.object({
      label: z.any(),
      unit: z.any().optional().nullable(),
      value: z.any(),
      color: z.any().optional().nullable(),
    })).optional().default([]),
    body_grid: z.array(z.object({
      label: z.any(),
      sub: z.any().optional().nullable(),
      value: z.any(),
    })).optional().default([]),
    timeline: z.array(z.object({
      year: z.any(),
      text: z.any(),
    })).optional().default([]),
    quote: z.object({
      text: z.any(),
      source: z.any().optional().nullable(),
    }).optional().nullable(),
    num_strip: z.array(z.object({
      label: z.any(),
      num: z.any(),
    })).optional().default([]),
    quote_list: z.array(z.any()).optional().default([]),
    video: z.any().optional().nullable(),
    comment: z.any().optional().nullable(),
    essay: z.any().optional().nullable(),
    tags: z.array(z.any()).optional().default([]),
    end_section: z.array(z.object({
      num: z.any(),
      unit: z.any().optional().nullable(),
      desc: z.any(),
    })).optional().default([]),
    footer: z.any().optional().nullable(),
    home_metadata: z.object({
      tag: z.any(),
      meta: z.any(),
      stats: z.array(z.object({
        val: z.any(),
        label: z.any(),
      })).optional().default([]),
    }).optional().nullable(),
    scores: z.object({
      popularity: z.number().min(0).max(10).default(5),
      dispute: z.number().min(0).max(10).default(5),
      absurdity: z.number().min(0).max(10).default(5),
      slice: z.number().min(0).max(10).default(5),
      narrative: z.number().min(0).max(10).default(5),
      native: z.number().min(0).max(10).default(5),
    }).optional().default({
      popularity: 5,
      dispute: 5,
      absurdity: 5,
      slice: 5,
      narrative: 5,
    }),
    clearance: z.enum(['A', 'B', 'C', 'D']).optional().default('D'),
    relics: z.array(z.object({
      name: z.string(),
      desc: z.string(),
    })).optional().default([]),
    glossary: z.array(z.object({
      key: z.string(),
      val: z.string(),
    })).optional().default([]),
  }),
});

export const collections = {
  'phenomenon': phenomenon,
};
