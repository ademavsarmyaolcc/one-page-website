'use strict';

// Gather every gallery link; each link points to a larger image while its img is the thumbnail.
const galleryLinks = [...document.querySelectorAll('[data-lightbox]')];

if (galleryLinks.length) {
  // Build the dialog once so every gallery image can reuse the same lightbox.
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox-dialog';
  dialog.setAttribute('aria-label', 'Image gallery');

  const frame = document.createElement('div');
  frame.className = 'lightbox-frame';

  const closeButton = document.createElement('button');
  closeButton.className = 'lightbox-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close image gallery');
  closeButton.textContent = '×';

  const previousButton = document.createElement('button');
  previousButton.className = 'lightbox-step lightbox-previous';
  previousButton.type = 'button';
  previousButton.setAttribute('aria-label', 'Previous image');
  previousButton.textContent = '‹';

  const nextButton = document.createElement('button');
  nextButton.className = 'lightbox-step lightbox-next';
  nextButton.type = 'button';
  nextButton.setAttribute('aria-label', 'Next image');
  nextButton.textContent = '›';

  const image = document.createElement('img');
  image.className = 'lightbox-image';
  image.alt = '';

  const caption = document.createElement('p');
  caption.className = 'lightbox-caption';
  caption.setAttribute('aria-live', 'polite');

  const counter = document.createElement('p');
  counter.className = 'lightbox-counter';
  counter.setAttribute('aria-live', 'polite');

  frame.append(closeButton, previousButton, image, nextButton, caption, counter);
  dialog.append(frame);
  document.body.append(dialog);

  let activeIndex = 0;
  let opener = null;

  // Display one image, update its accessible caption, and preload the adjacent images.
  function showImage(index) {
    activeIndex = (index + galleryLinks.length) % galleryLinks.length;
    const link = galleryLinks[activeIndex];
    const thumbnail = link.querySelector('img');
    const figureCaption = link.closest('figure')?.querySelector('figcaption')?.textContent.trim();

    image.src = link.href;
    image.alt = thumbnail?.alt || '';
    caption.textContent = figureCaption || image.alt;
    counter.textContent = `${activeIndex + 1} of ${galleryLinks.length}`;
    previousButton.disabled = galleryLinks.length < 2;
    nextButton.disabled = galleryLinks.length < 2;

    [activeIndex - 1, activeIndex + 1].forEach((neighbor) => {
      const adjacentLink = galleryLinks[(neighbor + galleryLinks.length) % galleryLinks.length];
      if (adjacentLink) {
        const preload = new Image();
        preload.src = adjacentLink.href;
      }
    });
  }

  // Open the selected full-size image and keep track of where focus should return.
  galleryLinks.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      opener = link;
      showImage(index);
      dialog.showModal();
      closeButton.focus();
    });
  });

  // Cycle through images with the arrow controls and keyboard arrow keys.
  previousButton.addEventListener('click', () => showImage(activeIndex - 1));
  nextButton.addEventListener('click', () => showImage(activeIndex + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(activeIndex + 1);
    }
  });

  // Close the dialog from its button or backdrop; Escape is handled natively by <dialog>.
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
}
