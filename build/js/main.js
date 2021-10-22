'use strict';

(function () {
  const ESCAPE_KEY = 27;
  const MIN_VIEWPORT_WIDTH_DESKTOP = 1024;
  const SLIDE_MARGIN = 1.0213;
  let intViewportWidth = window.innerWidth;
  const pageBody = document.querySelector('body');
  const pageHeader = pageBody.querySelector('.page-header');
  const pageHeaderLogin = pageBody.querySelector('.page-header__login');
  const navMain = pageBody.querySelector('.page-header__main-nav');
  const navToggle = pageBody.querySelector('.page-header__main-nav-toggle');
  const menuItems = pageBody.querySelectorAll('.page-header__site-menu-item');
  const siteSearch = pageBody.querySelector('.page-header__site-search');
  const sliderItems = Array.from(pageBody.querySelectorAll('.new-in__slider-item'));
  const sliderNumberButtons = Array.from(pageBody.querySelectorAll('.new-in__slider-number-button'));
  const sliderPreviousButton = pageBody.querySelector('.new-in__slider-previous-button');
  const sliderNextButton = pageBody.querySelector('.new-in__slider-next-button');
  const faqListItems = pageBody.querySelectorAll('.faq__list-item');
  const faqListItemsButtons = pageBody.querySelectorAll('.faq__list-item-toggle');
  const formItems = pageBody.querySelectorAll('.catalog-filter__form-item');
  const formToggles = pageBody.querySelectorAll('.catalog-filter__form-item-toggle');
  const formFooterFieldEmail = pageBody.querySelector('input[id="footer-email"]');
  const formLoginFieldEmail = pageBody.querySelector('input[id="login-email"]');
  const formFooterSubmitButton = pageBody.querySelector('.page-footer__news-subscription-form-button');
  const formLoginSubmitButton = pageBody.querySelector('.login__form-submit-button');
  const loginButton = pageBody.querySelector('.page-header__login-button');
  const loginPopup = pageBody.querySelector('.login--popup');
  const loginCloseButton = pageBody.querySelector('.login__close-button');
  const catalogFilterButton = pageBody.querySelector('.catalog-filter__button');
  const catalogFilterPopup = pageBody.querySelector('.catalog-filter__form');
  const catalogFilterCloseButton = pageBody.querySelector('.catalog-filter__close-form-button');
  const sliderCurrentItems = [];
  let sliderCurrentControls = [];
  let numberCurrentSlide = 0;
  let numberCurrentControl = 0;

  const getCurrentSlider = (items, controls) => {
    let quantitySliderControl = sliderNumberButtons.length;
    if (intViewportWidth >= MIN_VIEWPORT_WIDTH_DESKTOP) {
      quantitySliderControl = quantitySliderControl / 2;
    }
    items.forEach((item, i) => {
      if (intViewportWidth >= MIN_VIEWPORT_WIDTH_DESKTOP) {
        if (i % 2 === 0) {
          sliderCurrentItems.push(item);
        }
      } else {
        sliderCurrentItems.push(item);
      }
    });
    sliderCurrentControls= sliderNumberButtons.slice(0, quantitySliderControl);
  };

  getCurrentSlider(sliderItems, sliderNumberButtons);

  const slider = document.querySelector('.new-in__slider');

  if (slider) {
    var sliderList = slider.querySelector('.new-in__slider-list');
    var sliderTrack = slider.querySelector('.new-in__slider-track');
    var arrows = slider.querySelector('.new-in__slider-arrows');
    var numberActiveSlide = slider.querySelector('.new-in__slider-active-slide');
    var amountSlides = slider.querySelector('.new-in__slider-amount');
    var prev = arrows.children[0];
    var next = arrows.children[1];
    var slideWidth = slider.offsetWidth * SLIDE_MARGIN;
    var lastTrf = (sliderCurrentItems.length - 1) * slideWidth;
    var posThreshold = sliderCurrentItems[0].offsetWidth * 0.35;
  }

  let slideIndex = 0;
  let posInit = 0;
  let posX1 = 0;
  let posX2 = 0;
  let posY1 = 0;
  let posY2 = 0;
  let posFinal = 0;
  let isSwipe = false;
  let isScroll = false;
  let allowSwipe = true;
  let transition = true;
  let nextTrf = 0;
  let prevTrf = 0;
  const trfRegExp = /([-0-9.]+(?=px))/;
  let swipeStartTime = 0;
  let swipeEndTime = 0;

  const getEvent = function() {
    return (event.type.search('touch') !== -1) ? event.touches[0] : event;
  };

  const slide = function() {
    if (transition) {
      sliderTrack.style.transition = 'transform .5s';
    }
    sliderTrack.style.transform = `translate3d(-${slideIndex * slideWidth}px, 0px, 0px)`;

    prev.classList.toggle('new-in__slider-previous-button--off', slideIndex === 0);
    next.classList.toggle('new-in__slider-next-button--off', slideIndex === (sliderCurrentItems.length - 1));
  };

  const swipeStart = function() {
    let evt = getEvent();

    if (allowSwipe) {

      swipeStartTime = Date.now();

      transition = true;

      nextTrf = (slideIndex + 1) * -slideWidth;
      prevTrf = (slideIndex - 1) * -slideWidth;

      posInit = posX1 = evt.clientX;
      posY1 = evt.clientY;

      sliderTrack.style.transition = '';

      document.addEventListener('touchmove', swipeAction);
      document.addEventListener('mousemove', swipeAction);
      document.addEventListener('touchend', swipeEnd);
      document.addEventListener('mouseup', swipeEnd);

      sliderList.classList.remove('grab');
      sliderList.classList.add('grabbing');
    }
  };

  const swipeAction = function() {

    let evt = getEvent(),
    style = sliderTrack.style.transform,
    transform = +style.match(trfRegExp)[0];

    posX2 = posX1 - evt.clientX;
    posX1 = evt.clientX;

    posY2 = posY1 - evt.clientY;
    posY1 = evt.clientY;

    if (!isSwipe && !isScroll) {
      let posY = Math.abs(posY2);
      if (posY > 7 || posX2 === 0) {
        isScroll = true;
        allowSwipe = false;
      } else if (posY < 7) {
        isSwipe = true;
      }
    }

    if (isSwipe) {
      if (slideIndex === 0) {
        if (posInit < posX1) {
          setTransform(transform, 0);
          return;
        } else {
          allowSwipe = true;
        }
      }

      if (slideIndex === (sliderCurrentItems.length - 1)) {
        if (posInit > posX1) {
          setTransform(transform, lastTrf);
          return;
        } else {
          allowSwipe = true;
        }
      }

      if (posInit > posX1 && transform < nextTrf || posInit < posX1 && transform > prevTrf) {
        reachEdge();
        return;
      }
      sliderTrack.style.transform = `translate3d(${transform - posX2}px, 0px, 0px)`;
    }

  };

  const swipeEnd = function() {
    posFinal = posInit - posX1;

    isScroll = false;
    isSwipe = false;

    document.removeEventListener('touchmove', swipeAction);
    document.removeEventListener('mousemove', swipeAction);
    document.removeEventListener('touchend', swipeEnd);
    document.removeEventListener('mouseup', swipeEnd);

    sliderList.classList.add('grab');
    sliderList.classList.remove('grabbing');

    if (allowSwipe) {
      swipeEndTime = Date.now();
      if (Math.abs(posFinal) > posThreshold || swipeEndTime - swipeStartTime < 300) {
        sliderCurrentControls[slideIndex].classList.remove('new-in__slider-number-button--active');
        if (posInit < posX1) {
          slideIndex--;
        } else if (posInit > posX1) {
          slideIndex++;
        }
        numberActiveSlide.textContent = slideIndex + 1;
        sliderCurrentControls[slideIndex].classList.add('new-in__slider-number-button--active');
      }

      if (posInit !== posX1) {
        allowSwipe = false;
        slide();
      } else {
        allowSwipe = true;
      }

    } else {
      allowSwipe = true;
    }
  };

  const setTransform = function(transform, comapreTransform) {
    if (transform >= comapreTransform) {
      if (transform > comapreTransform) {
        sliderTrack.style.transform = `translate3d(${comapreTransform}px, 0px, 0px)`;
      }
    }
    allowSwipe = false;
  };

  const reachEdge = function() {
    transition = false;
    swipeEnd();
    allowSwipe = true;
  };

  if (slider) {
    amountSlides.textContent = sliderCurrentItems.length;
    sliderTrack.style.transform = 'translate3d(0px, 0px, 0px)';
    prev.classList.add('new-in__slider-previous-button--off');
    sliderList.classList.add('grab');
    sliderTrack.addEventListener('transitionend', () => allowSwipe = true);
    if (intViewportWidth < MIN_VIEWPORT_WIDTH_DESKTOP) {
      slider.addEventListener('touchstart', swipeStart);
      slider.addEventListener('mousedown', swipeStart);
    }

    arrows.addEventListener('click', function() {
      let target = event.target;
      if (target.classList.contains('new-in__slider-next-button') && slideIndex < sliderCurrentItems.length - 1) {
        sliderCurrentControls[slideIndex].classList.remove('new-in__slider-number-button--active');
        slideIndex++;
        sliderCurrentControls[slideIndex].classList.add('new-in__slider-number-button--active');
      } else if (target.classList.contains('new-in__slider-previous-button') && slideIndex > 0) {
        sliderCurrentControls[slideIndex].classList.remove('new-in__slider-number-button--active');
        slideIndex--;
        sliderCurrentControls[slideIndex].classList.add('new-in__slider-number-button--active');
      } else {
        return;
      }

      slide();
      prev.classList.toggle('new-in__slider-previous-button--off', slideIndex === 0);
      next.classList.toggle('new-in__slider-next-button--off', slideIndex === (sliderCurrentItems.length - 1));
    });
  }

  const showListItem = (evt, items, index) => {
    evt.preventDefault();
    if (evt.target.classList.contains('catalog-filter__form-item-toggle')) {
      items[index].classList.toggle('catalog-filter__form-item--open');
    } else if (evt.target.classList.contains('faq__list-item-toggle')) {
      items.forEach((item, i) => {
        if (index !== i) {
          item.classList.remove('faq__list-item--open');
        }
      });
      items[index].classList.toggle('faq__list-item--open');
    }
  };

  if (formItems.length > 0) {
    formItems[0].classList.add('catalog-filter__form-item--open');
    formItems[formItems.length - 1].classList.add('catalog-filter__form-item--open');
    formToggles.forEach((formToggle, i) => {
      formItems[i].classList.remove('catalog-filter__form-item--nojs');
      formToggle.addEventListener('click', (evt) => {
        showListItem(evt, formItems, i);
      });
    });
  };

  if (faqListItems.length > 0) {
    faqListItems[0].classList.add('faq__list-item--open');
    faqListItemsButtons.forEach((faqListItemsButton, i) => {
      faqListItems[i].classList.remove('faq__list-item--nojs');
      faqListItemsButton.addEventListener('click', (evt) => {
        showListItem(evt, faqListItems, i);
      });
    });
  };

  sliderCurrentControls.forEach((sliderCurrentControl, i) => {
    sliderCurrentControl.addEventListener('click', (evt) => {
      sliderCurrentControls[slideIndex].classList.remove('new-in__slider-number-button--active');
      slideIndex = i;
      sliderTrack.style.transform = `translate3d(-${slideIndex * slideWidth}px, 0px, 0px)`;
      sliderCurrentControls[slideIndex].classList.add('new-in__slider-number-button--active');
      prev.classList.toggle('new-in__slider-previous-button--off', slideIndex === 0);
      next.classList.toggle('new-in__slider-next-button--off', slideIndex === (sliderCurrentItems.length - 1));
    });
  });

  const showMenu = () => {
    if (navMain.classList.contains('page-header__main-nav--closed')) {
      navMain.classList.remove('page-header__main-nav--closed');
      siteSearch.classList.remove('page-header__site-search--closed');
      pageHeader.classList.add('page-header--menu-style');
      pageHeaderLogin.classList.add('page-header__login--menu-style');
      pageBody.style.overflow = 'hidden';
    } else {
      navMain.classList.add('page-header__main-nav--closed');
      siteSearch.classList.add('page-header__site-search--closed');
      pageHeader.classList.remove('page-header--menu-style');
      pageHeaderLogin.classList.remove('page-header__login--menu-style');
      pageBody.style.overflow = 'scroll';
    }
  };

  if (navMain && navToggle) {
    navMain.classList.remove('page-header__main-nav--nojs')
    navMain.classList.add('page-header__main-nav--closed');
    navToggle.addEventListener('click', showMenu);
    menuItems.forEach((menuItem) => {
      menuItem.addEventListener('click', showMenu);
    });
  }

  const setLocalStorage = () => {
    if (formFooterFieldEmail && formFooterFieldEmail.value.length > 0) {
      localStorage.setItem('userEmail', formFooterFieldEmail.value);
    }
    if (formLoginFieldEmail && formLoginFieldEmail.value.length > 0) {
      localStorage.setItem('userEmail', formLoginFieldEmail.value);
    }
  };

  const openPopup = (evt) => {
    const isLoginPopup = evt.target == loginButton.querySelector('span');
    pageBody.classList.add('body-popup-background');
    pageBody.style.overflow = 'hidden';
    if (isLoginPopup) {
      loginPopup.classList.add('login--opened');
      formLoginFieldEmail.focus();
    }
    if (evt.target == catalogFilterButton) {
      catalogFilterPopup.classList.add('catalog-filter__form--opened');
    }
    setTimeout(() => document.addEventListener('click', outsideClickListener), 1);
  };

  const closePopup = () => {
    pageBody.classList.remove('body-popup-background');
    pageBody.style.overflow = 'scroll';
    if (loginPopup && loginPopup.classList.contains('login--opened')) {
      loginPopup.classList.remove('login--opened');
    }
    if (catalogFilterPopup && catalogFilterPopup.classList.contains('catalog-filter__form--opened')) {
      catalogFilterPopup.classList.remove('catalog-filter__form--opened');
    }
    document.removeEventListener('click', outsideClickListener);
  };

  const outsideClickListener = function(evt) {
    if (evt.target.classList.contains('body-popup-background')) {
      closePopup();
    }
  }

  formFooterSubmitButton ? formFooterSubmitButton.addEventListener('click', (evt) => {
    setLocalStorage();
  }) : '';

  formLoginSubmitButton ? formLoginSubmitButton.addEventListener('click', (evt) => {
    setLocalStorage();
  }) : '';

  loginButton ? loginButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    openPopup(evt);
  }) : '';

  catalogFilterButton ? catalogFilterButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    openPopup(evt);
  }) : '';

  loginCloseButton ? loginCloseButton.addEventListener('click', () => {
    closePopup();
  }) : '';

  catalogFilterCloseButton ? catalogFilterCloseButton.addEventListener('click', () => {
    closePopup();
  }) : '';

  window.addEventListener('keydown', (evt) => {
    if (evt.keyCode === ESCAPE_KEY) {
      closePopup();
    }
  });
})();
