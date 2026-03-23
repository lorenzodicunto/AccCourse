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
    interactionCount: 0,
    startTime: null,
    totalScore: 0,
    maxScore: 0,

    init: function() {
      if (this.api && !this.initialized) {
        var result = this.api.LMSInitialize('');
        this.initialized = (result === 'true' || result === true);
        if (this.initialized) {
          this.set('cmi.core.lesson_status', 'incomplete');
          this.startTime = new Date();
          // Resume from bookmark if available
          var bookmark = this.getBookmark();
          if (bookmark > 0 && window.goToSlide) {
            window.goToSlide(bookmark);
          }
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

    // ─── Interaction Tracking ───
    setInteraction: function(id, type, studentResponse, correctResponse, result, weight) {
      var idx = this.interactionCount;
      this.set('cmi.interactions.' + idx + '.id', 'interaction_' + id);
      this.set('cmi.interactions.' + idx + '.type', type);
      this.set('cmi.interactions.' + idx + '.student_response', studentResponse);
      this.set('cmi.interactions.' + idx + '.correct_responses.0.pattern', correctResponse);
      this.set('cmi.interactions.' + idx + '.result', result);
      this.set('cmi.interactions.' + idx + '.weighting', String(weight));
      this.set('cmi.interactions.' + idx + '.time', this.getTimestamp());
      this.interactionCount++;

      // Update score
      if (result === 'correct') {
        this.totalScore += weight;
      }
      this.maxScore += weight;
      this.save();
    },

    // ─── Score Management ───
    complete: function() {
      this.set('cmi.core.lesson_status', 'completed');
      this.setSessionTime();
      this.save();
    },

    setScore: function(score, passingScore) {
      passingScore = passingScore || 70;
      this.set('cmi.core.score.raw', String(Math.round(score)));
      this.set('cmi.core.score.min', '0');
      this.set('cmi.core.score.max', '100');
      if (score >= passingScore) {
        this.set('cmi.core.lesson_status', 'passed');
      } else {
        this.set('cmi.core.lesson_status', 'failed');
      }
      this.save();
    },

    // Calculate and set final score from interactions
    calculateScore: function(passingScore) {
      if (this.maxScore > 0) {
        var pct = Math.round((this.totalScore / this.maxScore) * 100);
        this.setScore(pct, passingScore);
        return pct;
      }
      return 0;
    },

    // ─── Session Time ───
    setSessionTime: function() {
      if (!this.startTime) return;
      var now = new Date();
      var diff = Math.floor((now - this.startTime) / 1000);
      var h = Math.floor(diff / 3600);
      var m = Math.floor((diff % 3600) / 60);
      var s = diff % 60;
      var time = this.pad(h) + ':' + this.pad(m) + ':' + this.pad(s);
      this.set('cmi.core.session_time', time);
    },

    getTimestamp: function() {
      var now = new Date();
      return this.pad(now.getHours()) + ':' + this.pad(now.getMinutes()) + ':' + this.pad(now.getSeconds());
    },

    pad: function(n) {
      return n < 10 ? '0' + n : String(n);
    },

    // ─── Bookmarking ───
    setBookmark: function(slideIndex) {
      this.set('cmi.core.lesson_location', String(slideIndex));
      this.save();
    },

    getBookmark: function() {
      var loc = this.get('cmi.core.lesson_location');
      return loc ? parseInt(loc, 10) : 0;
    },

    // ─── Suspend Data (for branching paths) ───
    setSuspendData: function(data) {
      this.set('cmi.suspend_data', JSON.stringify(data));
      this.save();
    },

    getSuspendData: function() {
      var data = this.get('cmi.suspend_data');
      try { return data ? JSON.parse(data) : {}; } catch(e) { return {}; }
    },

    // ─── Finish ───
    finish: function() {
      if (this.api && this.initialized && !this.finished) {
        this.setSessionTime();
        this.save();
        this.api.LMSFinish('');
        this.finished = true;
      }
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
