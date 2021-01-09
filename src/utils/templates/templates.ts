import * as fs from 'fs';
import * as T from './placeholders/metadata-placeholders';
import { defaultTemplate } from './default-template';
import { YarleOptions } from '../../YarleOptions';
import { NoteData } from '../../models/NoteData';
import {
  applyContentTemplate,
  applyCreatedAtTemplate,
  applyLinkToOriginalTemplate,
  applyLocationTemplate,
  applyNotebookTemplate,
  applySourceUrlTemplate,
  applyTagsTemplate,
  applyTitleTemplate,
  applyUpdatedAtTemplate,
  } from './apply-functions';

import {
  removeCreatedAtPlaceholder,
  removeLinkToOriginalTemplate,
  removeLocationPlaceholder,
  removeMetadataBlockPlaceholder,
  removeNotebookPlaceholder,
  removeSourceUrlPlaceholder,
  removeUpdatedAtPlaceholder,
 } from './remove-functions';
import { hasCreationTimeInTemplate, hasLocationInTemplate, hasSourceURLInTemplate, hasTagsInTemplate, hasUpdateTimeInTemplate, hasNotebookInTemplate, hasMetadataInTemplate, hasLinkToOriginalInTemplate } from './checker-functions';

export const applyTemplate = (noteData: NoteData, yarleOptions: YarleOptions) => {
  let result = defaultTemplate;
  if (yarleOptions.templateFile) {
    // todo: handle file not exists error
    result = fs.readFileSync(yarleOptions.templateFile, 'utf-8');
    yarleOptions.skipCreationTime = !hasCreationTimeInTemplate(result);
    yarleOptions.skipLocation = !hasLocationInTemplate(result);
    yarleOptions.skipSourceUrl = !hasSourceURLInTemplate(result);
    yarleOptions.skipTags = !hasTagsInTemplate(result);
    yarleOptions.skipUpdateTime = !hasUpdateTimeInTemplate(result);
    yarleOptions.isNotebookNameNeeded = hasNotebookInTemplate(result);
    yarleOptions.isMetadataNeeded = hasMetadataInTemplate(result);
    yarleOptions.keepOriginalHtml = hasLinkToOriginalInTemplate(result);
  }
 

  result = applyTitleTemplate(noteData, result, () => noteData.title);
  result = applyTagsTemplate(noteData, result, () => !yarleOptions.skipTags);
  result = applyContentTemplate(noteData, result, () => noteData.content);

  if (yarleOptions.isMetadataNeeded) {
    result = (yarleOptions.keepOriginalHtml && noteData.linkToOriginal)
      ? applyLinkToOriginalTemplate(noteData, result)
      : removeLinkToOriginalTemplate(result);

    result = (!yarleOptions.skipCreationTime && noteData.createdAt)
      ? applyCreatedAtTemplate(noteData, result)
      : removeCreatedAtPlaceholder(result);

    result = (!yarleOptions.skipUpdateTime && noteData.updatedAt)
      ? applyUpdatedAtTemplate(noteData, result)
      : removeUpdatedAtPlaceholder(result);

    result = (!yarleOptions.skipSourceUrl && noteData.sourceUrl)
      ? applySourceUrlTemplate(noteData, result)
      : removeSourceUrlPlaceholder(result);

    result = (!yarleOptions.skipLocation && noteData.location)
      ? applyLocationTemplate(noteData, result)
      : removeLocationPlaceholder(result);

    result = (yarleOptions.isNotebookNameNeeded && noteData.notebookName)
      ? applyNotebookTemplate(noteData, result)
      : removeNotebookPlaceholder(result);

    result = result
      .replace(T.START_BLOCK, '')
      .replace(T.END_BLOCK, '');
  } else {
    result = removeMetadataBlockPlaceholder(result);
  }

  return result;
};
