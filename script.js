(function () {
  'use strict';

  const textarea = document.getElementById('essay-textarea');
  const wordCountEl = document.getElementById('word-count');
  const charCountEl = document.getElementById('char-count');
  const paraCountEl = document.getElementById('para-count');
  const sentenceCountEl = document.getElementById('sentence-count');
  const avgWordLenEl = document.getElementById('avg-word-len');
  const readTimeEl = document.getElementById('read-time');
  const uniqueWordsEl = document.getElementById('unique-words');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const toast = document.getElementById('toast');

  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2400);
  }

  function countWords(text) {
    var trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function countSentences(text) {
    var matches = text.match(/[^.!?]*[.!?]+/g);
    return matches ? matches.length : (text.trim() ? 1 : 0);
  }

  function countParagraphs(text) {
    var trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\n\s*\n+/).filter(function (p) {
      return p.trim().length > 0;
    }).length;
  }

  function avgWordLength(text) {
    var words = text.trim().split(/\s+/).filter(function (w) {
      return w.length > 0;
    });
    if (!words.length) return '—';
    var total = words.reduce(function (sum, w) {
      return sum + w.replace(/[^a-zA-Z]/g, '').length;
    }, 0);
    return (total / words.length).toFixed(1);
  }

  function uniqueWordCount(text) {
    var words = text.toLowerCase().match(/\b[a-z']+\b/g);
    if (!words) return 0;
    return new Set(words).size;
  }

  function estimateReadTime(wordCount) {
    // Average adult reads ~238 words per minute
    var minutes = wordCount / 238;
    if (minutes < 1) return '< 1 min';
    return Math.ceil(minutes) + ' min';
  }

  function updateStats() {
    var text = textarea.value;
    var words = countWords(text);
    var chars = text.length;
    var paras = countParagraphs(text);
    var sentences = countSentences(text);

    wordCountEl.textContent = words.toLocaleString();
    charCountEl.textContent = chars.toLocaleString();
    paraCountEl.textContent = paras.toLocaleString();
    sentenceCountEl.textContent = sentences.toLocaleString();
    avgWordLenEl.textContent = words > 0 ? avgWordLength(text) : '—';
    readTimeEl.textContent = words > 0 ? estimateReadTime(words) : '—';
    uniqueWordsEl.textContent = words > 0 ? uniqueWordCount(text).toLocaleString() : '—';
  }

  textarea.addEventListener('input', updateStats);

  btnClear.addEventListener('click', function () {
    if (textarea.value && window.confirm('Clear the essay? This cannot be undone.')) {
      textarea.value = '';
      updateStats();
      showToast('Essay cleared.');
    }
  });

  btnCopy.addEventListener('click', function () {
    if (!textarea.value.trim()) {
      showToast('Nothing to copy.');
      return;
    }
    if (!navigator.clipboard) {
      showToast('Clipboard not available in this browser.');
      return;
    }
    navigator.clipboard.writeText(textarea.value).then(function () {
      showToast('Copied to clipboard!');
    }).catch(function () {
      showToast('Could not copy to clipboard.');
    });
  });

  btnDownload.addEventListener('click', function () {
    if (!textarea.value.trim()) {
      showToast('Nothing to download.');
      return;
    }
    var blob = new Blob([textarea.value], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'essay.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Essay downloaded.');
  });

  // Initialize stats on load (in case textarea has pre-filled content)
  updateStats();
}());
