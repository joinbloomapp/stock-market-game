/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

namespace ClipboardUtils {
  interface ICopyToClipboard {
    /** HTML reference identifier ```<div id="foo"></div>```  */
    target?: string;
    /** String value */
    value?: string;
    /** (Optional) message to display in snackbar on success */
    message?: string;
  }

  /**
   * Copy some text to the user's device clipboard
   *
   * @param param0 metadata for copying
   */
  export async function copyToClipboard({ target, message, value }: ICopyToClipboard) {
    try {
      let copyValue = '';

      if (!navigator.clipboard) {
        throw new Error("Browser don't have support for native clipboard.");
      }

      if (target) {
        const node = document.querySelector(target);

        if (!node || !node.textContent) {
          throw new Error('Element not found');
        }

        value = node.textContent;
      }

      if (value) {
        copyValue = value;
      }

      await navigator.clipboard.writeText(copyValue);
    } catch (error) {
      console.log(error);
    }
  }
}

export default ClipboardUtils;
