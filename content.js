/**
 * Checks for a button that meets certain conditions and clicks it.
 * If the button is not active, it retries until the maximum number of retries is reached.
 */
function checkAndClickButton(
  conditionCallback,
  successUrlPattern,
  closeBtnText,
  maxRetries,
  retryInterval = 1000,
  retries = 0,
) {
  const button = Array.from(document.querySelectorAll('button')).find(
    conditionCallback,
  );

  if (button && !button.disabled) {
    console.log('Active button found:', button);
    button.click();
    waitForPageLoad(successUrlPattern, closeBtnText, maxRetries);
  } else {
    if (retries < maxRetries) {
      console.log(
        `Retry ${
          retries + 1
        }/${maxRetries}... Waiting for the button to become active...`,
      );
      setTimeout(
        () =>
          checkAndClickButton(
            conditionCallback,
            successUrlPattern,
            closeBtnText,
            maxRetries,
            retryInterval,
            retries + 1,
          ),
        retryInterval,
      );
    } else {
      console.log('Max retries reached. Stopping.');
    }
  }
}

/**
 * Waits for the page to load and matches a specific URL pattern before clicking the close button.
 */
function waitForPageLoad(
  urlPattern,
  closeBtnText,
  maxRetries,
  retryInterval = 1000,
  retries = 0,
) {
  const checkUrl = () => {
    if (window.location.href.match(urlPattern)) {
      clickCloseButton(closeBtnText, maxRetries);
    } else {
      if (retries < maxRetries) {
        console.log(
          `Retry ${retries + 1}/${maxRetries}... Waiting for page load...`,
        );
        setTimeout(checkUrl, retryInterval, retries + 1);
      } else {
        console.log('Max retries reached. Stopping.');
      }
    }
  };

  checkUrl();
}

/**
 * Finds and clicks a button with specific text. Retries until the button is found or max retries is reached.
 */
function clickCloseButton(
  closeBtnText,
  maxRetries,
  retryInterval = 1000,
  retries = 0,
) {
  const buttons = Array.from(document.querySelectorAll('button'));
  const closeButton = buttons.find((button) =>
    button.textContent.includes(closeBtnText),
  );

  if (closeButton) {
    console.log('Close button found:', closeButton);
    setTimeout(() => {
      console.log('Clicking the close button now...');
      closeButton.click();
    }, retryInterval);
  } else {
    if (retries < maxRetries) {
      console.log(
        `Retry ${retries + 1}/${maxRetries}... Waiting for the close button...`,
      );
      setTimeout(
        () =>
          clickCloseButton(
            closeBtnText,
            maxRetries,
            retryInterval,
            retries + 1,
          ),
        retryInterval,
      );
    } else {
      console.log('Max retries reached. Stopping.');
    }
  }
}

/**
 * Deletes a bucket by filling the bucket name and clicking the delete button.
 */
function deleteBucket() {
  const url = window.location.href;
  console.log(`URL: ${url}`);

  const pattern = /s3\.console\.aws\.amazon\.com\/s3\/bucket\/([^ ]+)\/delete/;
  const match = url.match(pattern);

  if (!match) {
    console.log('URL does not match the required pattern.');
    return false;
  }

  const bucketName = match[1];
  console.log(`bucketName: ${bucketName}`);
  let isBucketNameFilled = false;

  if (bucketName) {
    document.querySelectorAll('input').forEach((input) => {
      if (input.placeholder === bucketName) {
        input.value = bucketName;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`Set bucket name '${bucketName}' to input field.`);
        isBucketNameFilled = true;
      }
    });

    const conditionCallback = (el) => /^Delete\s.*/.test(el.textContent.trim());
    const successUrlPattern =
      /s3\.console\.aws\.amazon\.com\/s3\/buckets\/[^\/]+\/object\/delete/;
    const closeBtnText = 'Close';
    const maxRetries = 5;

    checkAndClickButton(
      conditionCallback,
      successUrlPattern,
      closeBtnText,
      maxRetries,
    );
  }

  return isBucketNameFilled;
}

/**
 * Fills the 'delete' text in input fields and clicks the delete button.
 */
function fillDeleteText() {
  document.querySelectorAll('input').forEach((input) => {
    if (input.placeholder.toLowerCase().includes('delete')) {
      input.value = input.placeholder;
      console.log(`Set value of input to '${input.value}'`);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  const conditionCallback = (el) => /^Delete.*/.test(el.textContent.trim());
  const successUrlPattern = /console\.aws\.amazon\.com/;
  const closeBtnText = 'Close';
  const maxRetries = 5;

  checkAndClickButton(
    conditionCallback,
    successUrlPattern,
    closeBtnText,
    maxRetries,
  );
}

// メッセージリスナーを追加
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeScript') {
    if (!deleteBucket()) {
      fillDeleteText();
    }
  }
});
