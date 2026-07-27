// ============================================================
// Add Blog form — validation + interaction
// Only runs on pages that actually have the form (guards below
// mean this file is safe to include on every page).
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('postForm');
  if (!form) return; // not on this page, nothing to do

  const banner = document.getElementById('formBanner');
  const tagRow = document.getElementById('tagRow');

  const fields = {
    title: {
      input: document.getElementById('title'),
      error: document.getElementById('title-error'),
      validate: function (value) {
        if (!value.trim()) return 'Title is required.';
        if (value.trim().length < 3) return 'Title must be at least 3 characters.';
        return '';
      }
    },
    author: {
      input: document.getElementById('author'),
      error: document.getElementById('author-error'),
      validate: function (value) {
        if (!value.trim()) return 'Author name is required.';
        return '';
      }
    },
    date: {
      input: document.getElementById('date'),
      error: document.getElementById('date-error'),
      validate: function (value) {
        if (!value.trim()) return 'Publish date is required.';
        const pattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!pattern.test(value.trim())) return 'Use the format YYYY-MM-DD.';
        const parsed = new Date(value.trim());
        if (isNaN(parsed.getTime())) return 'That date does not look valid.';
        return '';
      }
    },
    summary: {
      input: document.getElementById('summary'),
      error: document.getElementById('summary-error'),
      validate: function (value) {
        if (value.length > 160) return 'Keep the summary under 160 characters.';
        return '';
      }
    },
    body: {
      input: document.getElementById('body'),
      error: document.getElementById('body-error'),
      validate: function (value) {
        if (!value.trim()) return 'Post content is required.';
        if (value.trim().length < 40) return 'Write at least 40 characters so the post has some substance.';
        return '';
      }
    }
  };

  // ---------- live character counters ----------
  const summaryCount = document.getElementById('summary-count');
  fields.summary.input.addEventListener('input', function () {
    summaryCount.textContent = fields.summary.input.value.length + ' / 160';
  });

  const bodyCount = document.getElementById('body-count');
  fields.body.input.addEventListener('input', function () {
    const len = fields.body.input.value.trim().length;
    bodyCount.textContent = len + ' characters' + (len < 40 ? ' (min 40)' : '');
  });

  // ---------- per-field validation helpers ----------
  function showError(field, message) {
    field.error.textContent = message;
    field.input.classList.toggle('invalid', Boolean(message));
    field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateField(key) {
    const field = fields[key];
    const message = field.validate(field.input.value);
    showError(field, message);
    return !message;
  }

  // validate on blur, clear error as soon as the person fixes it
  Object.keys(fields).forEach(function (key) {
    const field = fields[key];
    field.input.addEventListener('blur', function () {
      validateField(key);
    });
    field.input.addEventListener('input', function () {
      if (field.input.classList.contains('invalid')) {
        validateField(key);
      }
    });
  });

  // ---------- tag chips ----------
  const tagsError = document.getElementById('tags-error');

  function getSelectedTags() {
    return Array.from(tagRow.querySelectorAll('.tag-chip.selected')).map(function (chip) {
      return chip.dataset.tag;
    });
  }

  function validateTags() {
    const selected = getSelectedTags();
    tagsError.textContent = selected.length === 0 ? 'Pick at least one tag.' : '';
    return selected.length > 0;
  }

  tagRow.querySelectorAll('.tag-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      chip.classList.toggle('selected');
      validateTags();
    });
  });

  // ---------- banner helpers ----------
  function showBanner(kind, message) {
    banner.textContent = message;
    banner.className = 'form-banner ' + kind;
    banner.hidden = false;
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideBanner() {
    banner.hidden = true;
    banner.textContent = '';
  }

  // ---------- submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideBanner();

    const results = Object.keys(fields).map(validateField);
    const tagsOk = validateTags();
    const allValid = results.every(Boolean) && tagsOk;

    if (!allValid) {
      showBanner('error', 'Please fix the highlighted fields before saving.');
      // move focus to the first invalid field
      const firstInvalidKey = Object.keys(fields).find(function (key) {
        return fields[key].input.classList.contains('invalid');
      });
      if (firstInvalidKey) {
        fields[firstInvalidKey].input.focus();
      } else {
        tagRow.querySelector('.tag-chip').focus();
      }
      return;
    }

    const payload = {
      title: fields.title.input.value.trim(),
      author: fields.author.input.value.trim(),
      date: fields.date.input.value.trim(),
      summary: fields.summary.input.value.trim(),
      body: fields.body.input.value.trim(),
      tags: getSelectedTags(),
      status: document.getElementById('status').value
    };

    fetch('http://localhost:3000/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return {
            ok: response.ok,
            data: data
          };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error(result.data.message || 'Unable to save the post right now.');
        }

        const status = payload.status;
        const verb = status === 'published' ? 'published' : 'saved as a draft';
        showBanner('success', 'Post "' + payload.title + '" was ' + verb + ' successfully.');
        form.reset();
        tagRow.querySelectorAll('.tag-chip').forEach(function (chip) { chip.classList.remove('selected'); });
        tagRow.querySelector('.tag-chip').classList.add('selected');
        summaryCount.textContent = '0 / 160';
        bodyCount.textContent = '0 characters (min 40)';
        Object.keys(fields).forEach(function (key) { showError(fields[key], ''); });
      })
      .catch(function (error) {
        showBanner('error', error.message || 'Unable to save the post right now.');
      });
  });
});