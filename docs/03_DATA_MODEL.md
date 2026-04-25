# 03 — Data Model

## Current stage

`prisma/schema.prisma` currently contains only generator and datasource configuration. Product models are intentionally deferred to the data-model task.

## Entities to implement later

### User

Managed by auth provider. Store only external `userId` references in app tables.

### Resume

```txt
id
userId
title
sourceType: pdf | pasted_text
fileUrl?
rawText?
parsedJson
createdAt
updatedAt
```

### Application

```txt
id
userId
resumeId
companyName
roleTitle
jobDescription
stage: wishlist | applied | screening | interview | offer | rejected
jdExtractJson
diagnosisJson
createdAt
updatedAt
```

### ResumeBullet

Optional normalized table if needed later. MVP may keep bullets inside `parsedJson` until rewrite needs normalization.

```txt
id
userId
resumeId
path
content
createdAt
updatedAt
```

### AiGeneration

```txt
id
userId
applicationId?
resumeId?
type: resume_parse | jd_extract | diagnosis | rewrite | outreach | interview_review | weekly_report
model
promptVersion
inputHash
outputJson?
outputText?
usageJson?
status: success | failed
errorMessage?
createdAt
```

### InterviewNote

```txt
id
userId
applicationId
questionsJson
selfReflection
aiReviewJson?
createdAt
updatedAt
```

## Authorization

Every user-owned query must filter by `userId`.

## MVP simplification

Keep resume structured content in JSON first. Normalize only if a real feature requires it.
