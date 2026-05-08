/**
 * Al Majd floating chat — vanilla JS, no React / no backend.
 * Mount: #al-majd-chat-root with data-chat-context, optional data-whatsapp.
 */
;(function () {
  'use strict'

  var LEADS_KEY = 'al-majd-chat-leads'
  var PULSE_KEY = 'am-chat-pulse-seen'

  var SVG_CHAT =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
  var SVG_CLOSE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>'
  var SVG_CHEVRON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>'

  function readContext(raw) {
    var v = String(raw || 'general').toLowerCase()
    if (v === 'gifts' || v === 'branded' || v === 'advertising' || v === 'general') return v
    return 'general'
  }

  function getContextualPrompt(ctx) {
    switch (ctx) {
      case 'gifts':
        return 'Looking for birthday, wedding, or corporate gift ideas?'
      case 'branded':
        return 'Need custom logo printing or personalized gifts? Share your requirement.'
      case 'advertising':
        return 'Need banners, posters, or outdoor advertising solutions?'
      default:
        return 'How can we help with gifts, branding, or advertising today?'
    }
  }

  function getContextSubtitle(ctx) {
    switch (ctx) {
      case 'gifts':
        return 'Ideas by occasion & category'
      case 'branded':
        return 'Custom logo & personalization'
      case 'advertising':
        return 'Banners, posters & campaigns'
      default:
        return 'Corporate gifts · Branding · Advertising'
    }
  }

  function getBrowseLink(ctx) {
    switch (ctx) {
      case 'gifts':
        return { href: 'shop.html', label: 'Browse gift items' }
      case 'branded':
        return { href: 'branding.html', label: 'Branding services' }
      case 'advertising':
        return { href: 'advertising.html', label: 'Advertising services' }
      default:
        return { href: 'contact.html', label: 'Contact page' }
    }
  }

  function getQuickReplies(ctx) {
    switch (ctx) {
      case 'gifts':
        return ['Birthday gift ideas', 'Wedding & anniversary', 'Corporate / employees', 'Gift categories']
      case 'branded':
        return ['Logo printing', 'Bulk corporate order', 'Embroidery & UV', 'Personalized quote']
      case 'advertising':
        return ['Banners & roll-ups', 'Posters & flyers', 'Outdoor / signage', 'Campaign support']
      default:
        return ['Gift ideas', 'Branding', 'Advertising', 'Contact us']
    }
  }

  function botReply(text, ctx) {
    var t = text.toLowerCase()

    if (/price|cost|quote|how much|budget/.test(t)) {
      return 'We prepare quotes based on quantity, branding, and timeline. Share your item, quantity, and delivery date so we can respond with accurate options.'
    }
    if (/deliver|shipping|lead time|timeline|when/.test(t)) {
      return 'Lead times vary by product and customization. Tell us your deadline and delivery location—we will confirm feasibility and the fastest safe option.'
    }
    if (/contact|phone|email|call|reach/.test(t)) {
      return 'You can share details through the in-chat contact form or WhatsApp. If you leave your phone and requirement, our team will reach out promptly.'
    }
    if (/faq|return|policy|warranty/.test(t)) {
      return 'Terms depend on the product and customization level. Tell us what you plan to order and we will outline artwork approval, production milestones, and delivery.'
    }

    if (ctx === 'gifts' || /birthday|wedding|corporate|gift|occasion|employee|client/.test(t)) {
      if (/birthday/.test(t)) {
        return 'For birthdays, strong options include premium drinkware, compact tech accessories, and curated gift sets. Who is the recipient and what budget range should we aim for?'
      }
      if (/wedding|anniversary/.test(t)) {
        return 'For weddings and anniversaries, engraved keepsakes, elegant gift sets, and premium packaging work well. Are these for guests, the couple, or a corporate sponsor table?'
      }
      if (/corporate|employee|client/.test(t)) {
        return 'For corporate gifting, we often bundle practical desk items, quality drinkware, and branded apparel by tier. Approximate headcount and event date help us shortlist fast.'
      }
      return 'Happy to suggest gifts by occasion and audience. What is the occasion, who receives the gifts, and your approximate quantity?'
    }

    if (ctx === 'branded' || /logo|print|brand|embroidery|uv|personaliz|t-?shirt|apparel/.test(t)) {
      return 'We support multiple branding methods—screen print, UV, embroidery, and more—depending on material and durability needs. Share your logo format (vector preferred) and target products.'
    }

    if (
      ctx === 'advertising' ||
      /banner|poster|outdoor|campaign|flyer|sign|rollup|standee/.test(t)
    ) {
      return 'For advertising, we can support indoor/outdoor banners, posters, and campaign collateral. Please share sizes, quantities, finish (matte/gloss), and whether artwork is ready.'
    }

    if (/hello|hi\b|hey|good (morning|afternoon|evening)/.test(t)) {
      return 'Hello—thanks for reaching out. Tell us what you are planning (gifts, branding, or advertising) and any deadline, and we will guide the next step.'
    }

    return 'Thanks for your message. A specialist can refine recommendations with a bit more detail—occasion, quantity, and timeline—or you can submit the short contact form in this chat.'
  }

  var idSeq = 0
  function nextId() {
    idSeq += 1
    return 'm-' + Date.now() + '-' + idSeq
  }

  function el(tag, cls, attrs) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') n.textContent = attrs[k]
        else if (k === 'html') n.innerHTML = attrs[k]
        else n.setAttribute(k, attrs[k])
      })
    }
    return n
  }

  function mount(mountEl) {
    var winCfg = typeof window !== 'undefined' && window.__AL_MAJD_CHAT__ ? window.__AL_MAJD_CHAT__ : {}
    var context = readContext(mountEl.dataset.chatContext || winCfg.context)
    var whatsappRaw = mountEl.dataset.whatsapp || winCfg.whatsapp || ''
    var whatsappDigits = String(whatsappRaw).replace(/\D/g, '')

    var panelId = 'am-chat-panel-' + Math.random().toString(36).slice(2, 9)

    var state = {
      open: false,
      messages: [{ id: nextId(), role: 'bot', text: getContextualPrompt(context) }],
      typing: false,
      formOpen: false,
      leadName: '',
      leadPhone: '',
      leadReq: '',
      leadStatus: '',
    }

    var root = el('div', 'am-chat', { 'data-open': 'false' })
    var backdrop = el('div', 'am-chat__backdrop', { 'aria-hidden': 'true' })
    backdrop.tabIndex = -1

    var fab = el('button', 'am-chat__fab', { type: 'button', 'aria-expanded': 'false', 'aria-controls': panelId })
    try {
      if (!localStorage.getItem(PULSE_KEY)) fab.classList.add('am-chat__fab--pulse')
    } catch (e) {
      /* ignore */
    }
    var fabIconWrap = el('span', 'am-chat__fab-icon')
    fabIconWrap.innerHTML = SVG_CHAT
    fab.appendChild(fabIconWrap)
    fab.appendChild(el('span', 'am-chat__fab-label', { text: 'Chat' }))

    var panel = el('div', 'am-chat__panel', { id: panelId, role: 'dialog', 'aria-label': 'Al Majd assistant chat', 'aria-hidden': 'true' })

    var head = el('header', 'am-chat__head')
    var brand = el('div', 'am-chat__brand')
    brand.appendChild(el('span', 'am-chat__accent-bar', { 'aria-hidden': 'true' }))
    var headText = el('div', 'am-chat__head-text')
    headText.appendChild(el('p', 'am-chat__title', { text: 'Al Majd Assistant' }))
    headText.appendChild(el('p', 'am-chat__subtitle', { text: getContextSubtitle(context) }))
    brand.appendChild(headText)
    head.appendChild(brand)
    head.appendChild(el('span', 'am-chat__status am-chat__status--on', { title: 'Assistant ready' }))

    var browse = el('div', 'am-chat__browse')
    var bl = getBrowseLink(context)
    var browseA = el('a', 'am-chat__browse-link', { href: bl.href })
    browseA.innerHTML = '<span>' + bl.label + '</span>' + SVG_CHEVRON
    browse.appendChild(browseA)

    var body = el('div', 'am-chat__body')
    var typingRow = null

    var quick = el('div', 'am-chat__quick', { role: 'group', 'aria-label': 'Quick replies' })

    var formWrap = el('div')
    var form = el('form', 'am-chat__form')
    form.style.display = 'none'
    form.appendChild(el('p', 'am-chat__form-title', { text: 'Send your details' }))

    function labeledInput(labelText, inputEl) {
      var lab = el('label', 'am-chat__label')
      lab.appendChild(document.createTextNode(labelText))
      lab.appendChild(inputEl)
      return lab
    }

    var inpName = el('input', 'am-chat__input', { autocomplete: 'name' })
    var inpPhone = el('input', 'am-chat__input', { autocomplete: 'tel', inputmode: 'tel' })
    var inpReq = el('textarea', 'am-chat__textarea', { rows: '3' })
    form.appendChild(labeledInput('Name', inpName))
    form.appendChild(labeledInput('Phone', inpPhone))
    form.appendChild(labeledInput('Requirement', inpReq))
    var formNote = el('p', 'am-chat__form-note')
    formNote.style.display = 'none'
    form.appendChild(formNote)
    var formActions = el('div', 'am-chat__form-actions')
    var btnFormClose = el('button', 'am-chat__btn am-chat__btn--ghost', { type: 'button', text: 'Close' })
    var btnFormSubmit = el('button', 'am-chat__btn am-chat__btn--primary', { type: 'submit', text: 'Submit' })
    formActions.appendChild(btnFormClose)
    formActions.appendChild(btnFormSubmit)
    form.appendChild(formActions)
    formWrap.appendChild(form)

    var foot = el('footer', 'am-chat__foot')
    var actions = el('div', 'am-chat__actions')
    var btnDetails = el('button', 'am-chat__btn am-chat__btn--ghost', { type: 'button', text: 'Send details' })
    actions.appendChild(btnDetails)
    var waLink = null
    if (whatsappDigits) {
      var prefill = encodeURIComponent(
        'Hello Al Majd — I need help with ' + (context === 'general' ? 'your services' : context) + '.'
      )
      waLink = el('a', 'am-chat__btn am-chat__btn--wa', {
        href: 'https://wa.me/' + whatsappDigits + '?text=' + prefill,
        target: '_blank',
        rel: 'noreferrer',
        text: 'WhatsApp',
      })
      actions.appendChild(waLink)
    }

    var composer = el('form', 'am-chat__composer')
    var inpMsg = el('input', 'am-chat__composer-input', { type: 'text', placeholder: 'Type a message…', 'aria-label': 'Message' })
    var btnSend = el('button', 'am-chat__send', { type: 'submit', 'aria-label': 'Send message', text: 'Send' })
    composer.appendChild(inpMsg)
    composer.appendChild(btnSend)

    foot.appendChild(actions)
    foot.appendChild(composer)

    panel.appendChild(head)
    panel.appendChild(browse)
    panel.appendChild(body)
    panel.appendChild(quick)
    panel.appendChild(formWrap)
    panel.appendChild(foot)

    root.appendChild(backdrop)
    root.appendChild(fab)
    root.appendChild(panel)
    mountEl.appendChild(root)

    function scrollBody() {
      requestAnimationFrame(function () {
        body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })
      })
    }

    function renderMessages() {
      body.innerHTML = ''
      state.messages.forEach(function (m, idx) {
        var row = el('div', 'am-chat__row am-chat__row--' + m.role)
        if (idx === 0) {
          row.className += ' am-chat__welcome'
          requestAnimationFrame(function () {
            row.classList.add('am-chat__welcome--in')
          })
        }
        var bubble = el('div', 'am-chat__bubble am-chat__bubble--' + m.role)
        bubble.textContent = m.text
        row.appendChild(bubble)
        body.appendChild(row)
      })

      if (state.typing) {
        typingRow = el('div', 'am-chat__row am-chat__row--bot')
        typingRow.setAttribute('aria-live', 'polite')
        var tb = el('div', 'am-chat__bubble am-chat__bubble--bot am-chat__typing')
        tb.setAttribute('aria-label', 'Assistant is typing')
        tb.appendChild(el('span', 'am-chat__dot'))
        tb.appendChild(el('span', 'am-chat__dot'))
        tb.appendChild(el('span', 'am-chat__dot'))
        typingRow.appendChild(tb)
        body.appendChild(typingRow)
      } else {
        typingRow = null
      }
      scrollBody()
    }

    function renderQuick() {
      quick.innerHTML = ''
      getQuickReplies(context).forEach(function (q) {
        var b = el('button', 'am-chat__chip', { type: 'button', text: q })
        b.addEventListener('click', function () {
          sendText(q)
        })
        quick.appendChild(b)
      })
    }

    function appendUser(text) {
      state.messages.push({ id: nextId(), role: 'user', text: text })
      renderMessages()
    }

    function appendBot(text) {
      state.messages.push({ id: nextId(), role: 'bot', text: text })
      renderMessages()
    }

    function sendText(raw) {
      var text = String(raw || '').trim()
      if (!text) return
      appendUser(text)
      inpMsg.value = ''
      state.typing = true
      renderMessages()
      var delay = 520 + Math.floor(Math.random() * 380)
      window.setTimeout(function () {
        state.typing = false
        appendBot(botReply(text, context))
      }, delay)
    }

    function setOpen(v) {
      state.open = v
      root.setAttribute('data-open', v ? 'true' : 'false')
      fab.setAttribute('aria-expanded', v ? 'true' : 'false')
      panel.setAttribute('aria-hidden', v ? 'false' : 'true')
      backdrop.setAttribute('aria-hidden', 'true')
      fabIconWrap.innerHTML = v ? SVG_CLOSE : SVG_CHAT
      if (v) {
        try {
          localStorage.setItem(PULSE_KEY, '1')
        } catch (e) {
          /* ignore */
        }
        fab.classList.remove('am-chat__fab--pulse')
        scrollBody()
        window.setTimeout(function () {
          inpMsg.focus()
        }, 200)
      } else {
        fab.focus()
      }
    }

    fab.addEventListener('click', function (e) {
      e.stopPropagation()
      setOpen(!state.open)
    })

    backdrop.addEventListener('click', function () {
      if (state.open) setOpen(false)
    })

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !state.open) return
      setOpen(false)
    })

    composer.addEventListener('submit', function (e) {
      e.preventDefault()
      sendText(inpMsg.value)
    })

    btnDetails.addEventListener('click', function () {
      state.formOpen = !state.formOpen
      form.style.display = state.formOpen ? 'block' : 'none'
      state.leadStatus = ''
      formNote.style.display = 'none'
      formNote.textContent = ''
      scrollBody()
    })

    btnFormClose.addEventListener('click', function () {
      state.formOpen = false
      form.style.display = 'none'
      scrollBody()
    })

    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var name = inpName.value.trim()
      var phone = inpPhone.value.trim()
      var requirement = inpReq.value.trim()
      if (!name || !phone || !requirement) {
        formNote.style.display = 'block'
        formNote.textContent = 'Please fill in name, phone, and requirement.'
        return
      }

      var record = {
        receivedAt: new Date().toISOString(),
        name: name,
        phone: phone,
        requirement: requirement,
        context: context,
        source: 'chat-widget-static',
      }

      try {
        var prev = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]')
        if (!Array.isArray(prev)) prev = []
        prev.push(record)
        localStorage.setItem(LEADS_KEY, JSON.stringify(prev))
      } catch (err) {
        /* ignore quota / private mode */
      }

      inpName.value = ''
      inpPhone.value = ''
      inpReq.value = ''
      state.formOpen = false
      form.style.display = 'none'
      appendBot('Thank you — your details were saved on this device. Our team will contact you soon. You can also reach us via WhatsApp or the Contact page.')
      scrollBody()
    })

    renderMessages()
    renderQuick()
  }

  function init() {
    var mountEl = document.getElementById('al-majd-chat-root')
    if (!mountEl) return
    mount(mountEl)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
