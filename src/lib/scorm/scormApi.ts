// SCORM 1.2 API Adapter (Runtime JavaScript)
// This file is included in the SCORM package and handles LMS communication

export const SCORM_API_JS = `
(function() {
  'use strict';

  // Find the SCORM API
  function findAPI(win) {
    var attempts = 0;
    while (win && (!win.API) && (win.parent) && (win.parent !== win) && (attempts < 10)) {
      win = win.parent;
      attempts++;
    }
    return win && win.API ? win.API : null;
  }

  var API = findAPI(window);
  if (!API && window.opener) {
    API = findAPI(window.opener);
  }

  // SCORM wrapper object
  window.SCORM = {
    api: API,
    initialized: false,
    finished: false,

    init: function() {
      if (this.api && !this.initialized) {
        var result = this.api.LMSInitialize('');
        this.initialized = (result === 'true' || result === true);
        if (this.initialized) {
          this.set('cmi.core.lesson_status', 'incomplete');
        }
      }
      return this.initialized;
    },

    get: function(key) {
      if (this.api && this.initialized) {
        return this.api.LMSGetValue(key);
      }
      return '';
    },

    set: function(key, value) {
      if (this.api && this.initialized) {
        return this.api.LMSSetValue(key, String(value));
      }
      return 'false';
    },

    save: function() {
      if (this.api && this.initialized) {
        return this.api.LMSCommit('');
      }
      return 'false';
    },

    complete: function() {
      this.set('cmi.core.lesson_status', 'completed');
      this.set('cmi.core.score.raw', '100');
      this.set('cmi.core.score.min', '0');
      this.set('cmi.core.score.max', '100');
      this.save();
    },

    setScore: function(score) {
      this.set('cmi.core.score.raw', String(score));
      this.set('cmi.core.score.min', '0');
      this.set('cmi.core.score.max', '100');
      if (score >= 70) {
        this.set('cmi.core.lesson_status', 'passed');
      } else {
        this.set('cmi.core.lesson_status', 'failed');
      }
      this.save();
    },

    finish: function() {
      if (this.api && this.initialized && !this.finished) {
        this.save();
        this.api.LMSFinish('');
        this.finished = true;
      }
    },

    setBookmark: function(slideIndex) {
      this.set('cmi.core.lesson_location', String(slideIndex));
      this.save();
    },

    getBookmark: function() {
      var loc = this.get('cmi.core.lesson_location');
      return loc ? parseInt(loc, 10) : 0;
    }
  };

  // Auto-init on load
  window.addEventListener('load', function() {
    SCORM.init();
  });

  // Auto-finish on unload
  window.addEventListener('beforeunload', function() {
    SCORM.finish();
  });
})();
`;
