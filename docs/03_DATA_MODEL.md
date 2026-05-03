# 03 — Data Model

## Current stage

`prisma/schema.prisma` contains the initial MVP data model, committed migrations, and a generated-client setup. Product records are scoped with `userId` and repository functions must keep enforcing current-user access.

## Current entities

### User

Managed by auth provider. Store only external `userId` references in app tables.

### Resume

```txt
id
userId
title
fileUrl?
filePath?
sourceText?
parsedJson
status: uploading | parsing | ready | failed
createdAt
updatedAt
```

Current implementation supports pasted-text resumes only. Pasted resumes store content in `sourceText`, start in `READY`, and can be parsed through `POST /api/resumes/[id]/parse` to populate `parsedJson`.

### Application

```txt
id
userId
resumeId?
companyName
roleTitle
location?
jdText
stage: preparing | applied | communicating | interviewing | offer | archived
jdExtractJson
diagnosisJson
greetingJson
weeklyBatchId
createdAt
updatedAt
```

Applications can be created before a resume is attached. `resumeId` is nullable and the relation uses `ON DELETE SET NULL` so deleting a resume detaches related applications instead of deleting them.

### ResumeBullet

```txt
id
userId
resumeId
sectionType
sectionTitle?
orderIndex
originalText
currentText
metadata
createdAt
updatedAt
```

This table is populated by pasted-text Resume Parse from parsed experience and project bullets. Re-parsing deletes old current-user bullets for the same resume before inserting regenerated rows.

### BulletRewrite

```txt
id
userId
resumeBulletId
applicationId
originalText
variantsJson
selectedVariantIndex?
createdAt
updatedAt
```

Planned for Bullet Rewrite; not used by the current UI.

### AiGeneration

```txt
id
userId
applicationId?
resumeId?
feature: resume_parse | jd_extract | diagnosis | rewrite | greeting | interview_review | weekly_insight
model
promptVersion
inputHash
outputJson?
outputText?
usageJson?
inputTokens?
outputTokens?
estimatedCost?
metadata?
status: success | failed
errorMessage?
createdAt
updatedAt
```

JD Extract records success/failure audit rows without storing the full JD input.

### UserPreference

```txt
id
userId
locale: EN | ZH_CN
createdAt
updatedAt
```

Stores the current user's workspace language preference. `userId` is unique so each Clerk user has at most one preference row. Service code maps Prisma values to app locales: `EN` -> `en`, `ZH_CN` -> `zh-CN`.

### InterviewReview

```txt
id
userId
applicationId
question
answer
feedback?
aiReviewJson?
createdAt
updatedAt
```

Planned for Interview Review; not used by the current UI.

## Authorization

Every user-owned query must filter by `userId`.

## MVP simplification

Keep resume structured content in JSON first. Populate normalized resume bullets only when Resume Parse or Bullet Rewrite requires them.
