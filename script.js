// ============================================================
// Blog list + add blog form
// The homepage renders posts from the backend API, while the
// add-blog page keeps its validation and submit flow.
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  const API_BASE_URL = '/api';
  const postGrid = document.getElementById('postGrid');
  const postDetail = document.getElementById('postDetail');

  function apiUrl(path) {
    return API_BASE_URL + (path.startsWith('/') ? path : '/' + path);
  }

  if (postGrid) {
    let allPosts = [];

    function formatDate(value) {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderDetail(post) {
      if (!postDetail) return;

      if (!post) {
        postDetail.hidden = true;
        postDetail.innerHTML = '';
        return;
      }

      const tags = Array.isArray(post.tags) && post.tags.length > 0 ? post.tags : ['General'];
      postDetail.hidden = false;
      postDetail.innerHTML = [
        '<p class="section-label">Reading now</p>',
        '<h2>' + escapeHtml(post.title || 'Untitled post') + '</h2>',
        '<div class="detail-meta">',
        '<span>By ' + escapeHtml(post.author || 'Unknown author') + '</span>',
        '<span>&middot;</span>',
        '<time datetime="' + escapeHtml(post.date || post.createdAt || '') + '">' + escapeHtml(formatDate(post.date || post.createdAt)) + '</time>',
        '</div>',
        '<p class="detail-body">' + escapeHtml(post.body || post.summary || 'No content available.') + '</p>',
        '<div class="detail-tags">' + tags.map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('') + '</div>'
      ].join('');

      const actionRow = document.createElement('div');
      actionRow.className = 'detail-actions';

      // add edit button/link
      const editLink = document.createElement('a');
      editLink.href = 'add_blog.html?id=' + encodeURIComponent(post.id);
      editLink.className = 'btn btn-secondary';
      editLink.textContent = 'Edit post';
      actionRow.appendChild(editLink);

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'btn btn-ghost';
      deleteButton.textContent = 'Delete post';
      deleteButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (!window.confirm('Delete this post?')) {
          return;
        }

        const selectedId = Number(post.id);
        fetch(apiUrl('/blogs/' + selectedId), {
          method: 'DELETE'
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
              throw new Error(result.data.message || 'Unable to delete this post.');
            }

            allPosts = allPosts.filter(function (entry) {
              return Number(entry.id) !== selectedId;
            });
            renderPosts(allPosts);
            renderDetail(null);
            history.replaceState(null, '', window.location.pathname + window.location.search);
          })
          .catch(function (error) {
            window.alert(error.message || 'Unable to delete this post.');
          });
      });
      actionRow.appendChild(deleteButton);
      postDetail.appendChild(actionRow);
    }

    function renderPosts(posts) {
      if (!posts || posts.length === 0) {
        postGrid.innerHTML = '<div class="empty-state">No posts yet. <a href="add_blog.html">Write the first one</a>.</div>';
        renderDetail(null);
        return;
      }

      const sortedPosts = posts.slice().sort(function (a, b) {
        const aDate = new Date(a.date || a.createdAt || 0).getTime();
        const bDate = new Date(b.date || b.createdAt || 0).getTime();
        return bDate - aDate;
      });

      postGrid.innerHTML = '';

      sortedPosts.forEach(function (post) {
        const card = document.createElement('a');
        card.href = '#';
        card.className = 'post-card';
        card.dataset.id = post.id;

        const firstTag = Array.isArray(post.tags) && post.tags.length > 0 ? post.tags[0] : (post.status === 'draft' ? 'Draft' : 'Post');
        const excerpt = post.summary || post.body || 'No preview available.';
        const safeExcerpt = excerpt.length > 140 ? excerpt.slice(0, 137) + '...' : excerpt;

        card.innerHTML = [
          '<div class="card-meta">',
          '<span class="tag">' + escapeHtml(firstTag) + '</span>',
          '<time datetime="' + escapeHtml(post.date || post.createdAt || '') + '">' + escapeHtml(formatDate(post.date || post.createdAt)) + '</time>',
          '</div>',
          '<h3>' + escapeHtml(post.title || 'Untitled post') + '</h3>',
          '<p>' + escapeHtml(safeExcerpt) + '</p>',
          '<span class="read-more">Read post <span class="arrow">&rarr;</span></span>'
        ].join('');

        card.addEventListener('click', function (event) {
          event.preventDefault();
          const selectedId = Number(post.id);
          history.replaceState(null, '', '#post-' + selectedId);
          fetch(apiUrl('/blogs/' + selectedId))
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
                throw new Error(result.data.message || 'Unable to load this post.');
              }
              renderDetail(result.data.post || null);
            })
            .catch(function () {
              renderDetail(post);
            });
        });

        postGrid.appendChild(card);
      });
    }

    function loadPosts() {
      fetch(apiUrl('/blogs'))
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
            throw new Error(result.data.message || 'Unable to load posts.');
          }
          allPosts = result.data.posts || [];
          renderPosts(allPosts);

          const hashId = window.location.hash.replace('#post-', '');
          if (hashId) {
            const selected = allPosts.find(function (entry) { return String(entry.id) === hashId; });
            if (selected) {
              renderDetail(selected);
            }
          }
        })
        .catch(function () {
          postGrid.innerHTML = '<div class="empty-state">Unable to load posts right now. Please make sure the server is running.</div>';
          renderDetail(null);
        });
    }

    window.addEventListener('hashchange', function () {
      const hashId = window.location.hash.replace('#post-', '');
      if (!hashId) {
        renderDetail(null);
        return;
      }

      const selected = allPosts.find(function (entry) { return String(entry.id) === hashId; });
      if (selected) {
        renderDetail(selected);
      }
    });

    loadPosts();
  }

  const form = document.getElementById('postForm');
  if (!form) return; // not on this page, nothing to do

  const banner = document.getElementById('formBanner');
  const tagRow = document.getElementById('tagRow');
  const urlParams = new URLSearchParams(window.location.search);
  const editIdParam = urlParams.get('id');

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

  const summaryCount = document.getElementById('summary-count');
  const bodyCount = document.getElementById('body-count');

  // If opened with an `id` param, load the post and prefill the form for editing
  if (editIdParam) {
    fetch(apiUrl('/blogs/' + editIdParam))
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          showBanner('error', 'Unable to load post for editing.');
          return;
        }

        const post = result.data.post;
        if (!post) {
          showBanner('error', 'Post not found.');
          return;
        }

        fields.title.input.value = post.title || '';
        fields.author.input.value = post.author || '';
        fields.date.input.value = post.date || '';
        fields.summary.input.value = post.summary || '';
        fields.body.input.value = post.body || '';
        summaryCount.textContent = (fields.summary.input.value || '').length + ' / 160';
        bodyCount.textContent = (fields.body.input.value || '').trim().length + ' characters';

        // select tags that match
        const selectedTags = Array.isArray(post.tags) ? post.tags : [];
        tagRow.querySelectorAll('.tag-chip').forEach(function (chip) {
          if (selectedTags.indexOf(chip.dataset.tag) !== -1) {
            chip.classList.add('selected');
          } else {
            chip.classList.remove('selected');
          }
        });

        // set status if present
        if (post.status) {
          const statusEl = document.getElementById('status');
          if (statusEl) statusEl.value = post.status;
        }

        // mark form as edit mode
        form.dataset.editId = String(post.id);
      })
      .catch(function () {
        showBanner('error', 'Unable to load post for editing.');
      });
  }

  // ---------- live character counters ----------
  fields.summary.input.addEventListener('input', function () {
    if (summaryCount) {
      summaryCount.textContent = fields.summary.input.value.length + ' / 160';
    }
  });

  fields.body.input.addEventListener('input', function () {
    if (bodyCount) {
      const len = fields.body.input.value.trim().length;
      bodyCount.textContent = len + ' characters' + (len < 40 ? ' (min 40)' : '');
    }
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

    const editId = form.dataset.editId;
    // Some environments/clients may not allow PUT; use a POST-based update endpoint when editing
    const submittingUrl = editId ? apiUrl('/blogs/update') : apiUrl('/blogs');
    const method = 'POST';

    const bodyPayload = editId ? Object.assign({ id: Number(editId) }, payload) : payload;

    fetch(submittingUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
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