// Version: 1.0.4
// Author:  Prathamesh Patil 
// Date: 2025-08-18
// modified Date: 2025-10-06
// Description: 1. created chat-widget with iframe.
//              2. Added msg_id to append response sequence in ui.
//              3. Arrow up will append users previous messages in textarea.


(function() {
    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Create and inject styles for the widget container and toggle button
    const styles = `
    .n8n-chat-widget {
        --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
        --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
        --chat--color-background: var(--n8n-chat-background-color, #ffffff);
        --chat--color-font: var(--n8n-chat-font-color, #333333);
        font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .n8n-chat-widget .chat-iframe {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: none;
        width: 350px;
        height: 500px;
        background: var(--chat--color-background);
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
        border: 1px solid rgba(133, 79, 255, 0.2);
        overflow: hidden;
        font-family: "Poppins", sans-serif;;
        resize: none;
        transition: none;
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 20px); right: 20px;   
    }

    .n8n-chat-widget .chat-iframe.position-left {
        right: 20px;   
        left: 20px;
    }

    .n8n-chat-widget .chat-iframe.open {
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        padding: 5px;
        background: linear-gradient(to right, rgb(8, 49, 130), #5c006b);
    }


    .n8n-chat-widget .chat-toggle {
        position: fixed;
        bottom: 33px;
        right: 20px; /* Changed from 53px to 20px for better positioning */
        width: auto;
        height: 50px;
        border-radius: 999px;
        background: transparent linear-gradient(109deg, #103278 0%, #5C006B 100%) 0% 0% no-repeat padding-box;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
        z-index: 999;
        transition: transform 0.3s ease-out;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 15px 0 5px;
        font-size: 13px;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        gap: 10px;
        min-width: 120px;
        user-select: none; /* Prevent text selection while dragging */
        touch-action: none; /* Prevent default touch behaviors */
    }

    .n8n-chatbot-tail {
        position: absolute;
        bottom: -8px;
        right: 30px;
        width: 0;
        height: 0;
        border-left: 0 solid transparent;
        border-right: 10px solid transparent;
        border-top: 8px solid #6a1b9a;
    }

    /* Position left variant */
    .n8n-chat-widget .chat-toggle.position-left {
        right: auto;
        left: 20px;
    }

    /* Dragging state */
    .n8n-chat-widget .chat-toggle.dragging {
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba(133, 79, 255, 0.4);
        cursor: grabbing !important;
    }

    /* Hover effect when not dragging */
    .n8n-chat-widget .chat-toggle:hover:not(.dragging) {
        transform: scale(1.02);
        box-shadow: 0 6px 16px rgba(133, 79, 255, 0.4);
    }

    /* Active state */
    .n8n-chat-widget .chat-toggle:active {
        transform: scale(0.98);
    }

    /* Smooth transitions for position changes */
    .n8n-chat-widget .chat-toggle {
        transition: all 0.3s ease-out, transform 0.2s ease-out;
    }

    .n8n-chatbot-tail {
        position: absolute;
        bottom: -8px;
        right: 30px;
        width: 0;
        height: 0;
        border-left: 0 solid transparent;
        border-right: 10px solid transparent;
        border-top: 8px solid #6a1b9a;
    }
    
    .n8n-chat-widget .chat-toggle::after {
        content: "Ask AARYA";
        white-space: nowrap;
        font-weight: normal;
    }



    .n8n-chat-widget .chat-toggle.position-left {
        right: auto;
        left: 20px;
    }

    .n8n-chat-widget .chat-toggle:hover {
        transform: scale(1.05);
    }

    .n8n-chat-widget .chat-toggle svg {
        width: 30px;
        height: 30px;
        fill: currentColor;
    }

    @media (max-width: 500px) {
    .n8n-chat-widget .chat-iframe,
    .n8n-chat-widget .chat-iframe.open {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        /* Use the dynamic vh unit */
        height:  calc(var(--vh, 1vh) * 100); /* dynamic height */
        max-height: calc(var(--vh, 1vh) * 100);
        

        width: 100vw;
        max-width: 100vw;

        border-radius: 0;
        box-shadow: none;
        border: none;

        padding: 0;
        font-size: 16px;
    }
    .n8n-chat-widget textarea,
    .n8n-chat-widget input {
        font-size: 16px; /* Prevent iOS zoom */
    }
    .n8n-chat-widget .chat-iframe {
        overscroll-behavior: contain;
        touch-action: manipulation;
    }

    .n8n-chat-widget .n8n-chat-header {
        height: 50px;
        flex-shrink: 0;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        z-index: 10;
    }

    .n8n-chat-widget .n8n-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        background: #ffffff;
    }

    .n8n-chat-widget .n8n-chat-input-wrapper {
        flex-shrink: 0;
        padding: 10px;
        background: #fff;
        border-top: 1px solid #ddd;
        z-index: 10;
    }

    .n8n-chat-widget textarea,
    .n8n-chat-widget input {
        font-size: 16px; /* Prevent iOS zoom */
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #ccc;
        resize: none;
        line-height: 1.4;
        outline: none;
    }

    }
    `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Default configuration
    const defaultConfig = {
        webhook: {
            url: '',
            route: 'general'
        },
        branding: {
            logo: " ",
            name: 'AARYA',
            welcomeText: 'Hi 👋, how can we help?',
            responseTimeText: 'We typically respond right away',
            poweredBy: {
                text: 'Powered by 6D Technologies',
                link: 'https://www.6dtechnologies.com/',
                logo: ''
            }
        },
        style: {
            primaryColor: '#854fff',
            secondaryColor: '#6b3fd4',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        },
        options: {
            allowFileUploads: true
        }
    };

    // Merge user config with defaults
    const config = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style },
            options: { ...defaultConfig.options, ...window.ChatWidgetConfig.options },
            wss: {...defaultConfig.wss, ...window.ChatWidgetConfig.wss },
            header: { ...defaultConfig.header, ...window.ChatWidgetConfig.header },
            params: { ...defaultConfig.params, ...window.ChatWidgetConfig.params }
        } : defaultConfig;

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    let currentFiles = [];
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    let iframeInitialized = false;
    // Global variables to track state
    let chatInitialized = false;


    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    
    // Set CSS variables for colors
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    // Create iframe instead of div
    const chatIframe = document.createElement('iframe');
    chatIframe.className = `chat-iframe${config.style.position === 'left' ? ' position-left' : ''}`;
    chatIframe.style.border = 'none';
    
    // Iframe styles for the content
    const iframeStyles = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            height: 100vh;
            overflow: hidden;
        }

        .n8n-chat-container {
            width: 100%;
            height: 100%;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            font-family: inherit;
            display: flex;
            flex-direction: column;
            background: linear-gradient(to right, rgb(8, 49, 130), #5c006b);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
        }

        .n8n-brand-header {
            padding: 1px;
            display: flex;
            align-items: center;
            gap: 12px;
            background-image: linear-gradient(to right, rgb(8, 49, 130), #5c006b);
            animation: BackgroundGradient 15s ease infinite;
            /* // border-bottom: 1px solid rgba(255, 255, 255, 0.2); */
            position: relative;
        }

        .n8n-brand-header img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
        }

        .n8n-brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: #ffffff;
        }

        .n8n-chat-interface {
            display: flex;
            flex-direction: column;
            height: 100%;
        }



        .n8n-chat-interface ::-webkit-scrollbar {
            width: 5px;
        }

        .n8n-chat-interface ::-webkit-scrollbar-track {
            background: transparent;
        }

        .n8n-chat-interface::-webkit-scrollbar-thumb {
            -webkit-border-radius: 10px;
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
        }


        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            flex-shrink: 0;
        }


        @keyframes pulse {
            0% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.1); }
            100% { transform: translateY(-50%) scale(1); }
        }




        .n8n-file-preview {
            display: flex;
            align-items: center;
            background: rgba(133, 79, 255, 0.1);
            padding: 8px 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            font-size: 12px;
            max-width: 90%;
            box-sizing: border-box;
            overflow: hidden;
            word-break: break-all;
        }

        .n8n-file-preview.audio {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            background: rgba(133, 79, 255, 0.2);
        }

        .n8n-file-preview.audio audio {
            width: 100%;
            height: 40px;
        }

        .n8n-file-preview-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            vertical-align: middle;
            word-break: break-all;
        }

        .n8n-file-preview-remove {
            background: none;
            border: none;
            cursor: pointer;
            color: #333333;
            opacity: 0.7;
            margin-left: 8px;
            padding: 2px 6px;
            border-radius: 4px;
        }

        .n8n-file-preview-remove:hover {
            background: rgba(133, 79, 255, 0.2);
            opacity: 1;
        }



        .n8n-confirmation-dialog {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            padding: 16px;
            z-index: 1001;
            width: 80%;
            max-width: 300px;
            text-align: center;
        }

        .n8n-confirmation-dialog h3 {
            margin: 0 0 12px;
            font-size: 16px;
            font-weight: 500;
            color: #333333;
        }

        .n8n-confirmation-dialog p {
            margin: 0 0 16px;
            font-size: 14px;
            color: #333333;
        }

        .n8n-confirmation-dialog .dialog-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }

        .n8n-confirmation-dialog button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-family: inherit;
        }

        .n8n-confirmation-dialog .cancel-button {
            background: #F3F4F6;
            color: #333333;
        }

        .n8n-confirmation-dialog .cancel-button:hover {
            background: #E5E7EB;
        }

        .n8n-confirmation-dialog .restart-button {
            background: #007BFF;
            color: white;
        }

        .n8n-confirmation-dialog .restart-button:hover {
            background: #0056b3;
        }

        .n8n-confirmation-dialog .dialog-close-button {
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #333333;
        }

        .n8n-chat-code-block {
            background: #23272e;
            color: #f8f8f2;
            border-radius: 6px;
            padding: 12px;
            margin: 8px 0;
            font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
            font-size: 13px;
            white-space: pre-wrap;
            word-break: break-all;
            max-width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
        }

        .n8n-chat-code-block-wrapper {
            position: relative;
        }

        .n8n-copy-code-btn {
            position: absolute;
            top: 8px;
            right: 12px;
            background: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 2px 10px;
            font-size: 12px;
            cursor: pointer;
            z-index: 2;
            opacity: 0.85;
            transition: opacity 0.2s;
        }

        .n8n-copy-code-btn:hover {
            opacity: 1;
        }

        .n8n-copy-code-btn.copied svg rect {
            stroke: #007bff;
        }


        .n8n-refresh-button {
            position: absolute;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #ffffff !important;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
            border-radius: 60%;
            width: 35px; 
        }

        .n8n-refresh-button:hover {
            opacity: 1;
            background-color: #333333;
        }

        .n8n-refresh-button svg {
            fill: rgb(156 140 140);
            width: 20px;
            height: 20px;
        }

        .n8n-close-button {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            color: #ffffff;
            font-size: 23px;
            border-radius: 50%;
            width: 28px;
            height: 28px;
        }

        /* //  .n8n-close-button:hover {
        //     background-color: #333333;
        //     opacity: 1;
        // }

        //  .n8n-brand-header img {
        //     width: 32px;
        //     height: 32px;
        //     border-radius: 50%;
        // } */

        .n8n-bot-avatar {
            background-image: url("data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' width='54' height='56'%3E%3Cpath d='M0 0 C0 1.32 0 2.64 0 4 C-0.66 4 -1.32 4 -2 4 C-2 4.99 -2 5.98 -2 7 C-1.26394531 7.09796875 -0.52789063 7.1959375 0.23046875 7.296875 C10.33390242 8.84508941 10.33390242 8.84508941 14 13 C14.8125 15.25 14.8125 15.25 15 17 C16.32 17.33 17.64 17.66 19 18 C19 21.63 19 25.26 19 29 C18.01 29.33 17.02 29.66 16 30 C14.79117904 32.00016466 14.79117904 32.00016466 14 34 C13.34 34 12.68 34 12 34 C12 34.66 12 35.32 12 36 C9.73192796 37.0067004 7.46092246 38.00551766 5.1875 39 C4.54490234 39.28617188 3.90230469 39.57234375 3.24023438 39.8671875 C0.32243531 41.13711041 -1.78265714 42 -5 42 C-5 40.68 -5 39.36 -5 38 C-5.75925781 37.95101562 -6.51851562 37.90203125 -7.30078125 37.8515625 C-8.29464844 37.77679688 -9.28851562 37.70203125 -10.3125 37.625 C-11.29863281 37.55539063 -12.28476562 37.48578125 -13.30078125 37.4140625 C-16 37 -16 37 -19 35 C-19 34.34 -19 33.68 -19 33 C-19.66 33 -20.32 33 -21 33 C-21 32.01 -21 31.02 -21 30 C-21.639375 29.87625 -22.27875 29.7525 -22.9375 29.625 C-23.9584375 29.315625 -23.9584375 29.315625 -25 29 C-26.20272819 26.59454362 -26.10071472 25.05003047 -26.0625 22.375 C-26.05347656 21.55773437 -26.04445313 20.74046875 -26.03515625 19.8984375 C-26.02355469 19.27195312 -26.01195312 18.64546875 -26 18 C-25.03900391 17.82597656 -25.03900391 17.82597656 -24.05859375 17.6484375 C-23.37925781 17.43445313 -22.69992188 17.22046875 -22 17 C-21.690625 16.21625 -21.38125 15.4325 -21.0625 14.625 C-19.62590758 11.07577167 -18.52451269 10.51050544 -15 9 C-11.35427854 8.17842897 -7.69568037 7.55014506 -4 7 C-4 6.01 -4 5.02 -4 4 C-4.66 4 -5.32 4 -6 4 C-6 2.68 -6 1.36 -6 0 C-3.50907189 -1.24546405 -2.58919267 -0.7767578 0 0 Z ' fill='%23CACDD0' transform='translate(31,7)'/%3E%3Cpath d='M0 0 C1.58748047 -0.0299707 1.58748047 -0.0299707 3.20703125 -0.06054688 C4.72876953 -0.05958008 4.72876953 -0.05958008 6.28125 -0.05859375 C7.6744043 -0.06137329 7.6744043 -0.06137329 9.09570312 -0.06420898 C11.5 0.4375 11.5 0.4375 13.3034668 2.30029297 C14.82430072 5.01675494 14.86729985 6.90170081 14.8125 10 C14.80863281 10.95003906 14.80476563 11.90007813 14.80078125 12.87890625 C14.5 15.4375 14.5 15.4375 12.5 18.4375 C8.4951979 19.880311 4.26936741 19.62140746 0.0625 19.625 C-0.68837891 19.63724609 -1.43925781 19.64949219 -2.21289062 19.66210938 C-6.39120456 19.67313395 -9.74381715 19.50014376 -13.5 17.4375 C-14.85281371 14.73187257 -14.70609362 12.51856345 -14.75 9.5 C-14.77578125 8.43910156 -14.8015625 7.37820312 -14.828125 6.28515625 C-14.5 3.4375 -14.5 3.4375 -13.30566406 1.78662109 C-9.60321762 -0.97970111 -4.44163789 -0.02975519 0 0 Z ' fill='%23071942' transform='translate(27.5,20.5625)'/%3E%3Cpath d='M0 0 C1.60294922 0.04060547 1.60294922 0.04060547 3.23828125 0.08203125 C4.04652344 0.11683594 4.85476562 0.15164063 5.6875 0.1875 C5.6875 1.5075 5.6875 2.8275 5.6875 4.1875 C4.84445313 4.30867188 4.00140625 4.42984375 3.1328125 4.5546875 C2.03710938 4.72226562 0.94140625 4.88984375 -0.1875 5.0625 C-1.82332031 5.30613281 -1.82332031 5.30613281 -3.4921875 5.5546875 C-6.43182714 5.95006513 -6.43182714 5.95006513 -8.3125 8.1875 C-8.55627883 11.54494112 -8.55627883 11.54494112 -8.4375 15.3125 C-8.39625 17.58125 -8.355 19.85 -8.3125 22.1875 C-3.6925 22.8475 0.9275 23.5075 5.6875 24.1875 C5.6875 25.5075 5.6875 26.8275 5.6875 28.1875 C0.02975575 29.36619672 -3.81360636 29.08367022 -9.3125 27.1875 C-9.6425 26.1975 -9.9725 25.2075 -10.3125 24.1875 C-10.9725 24.1875 -11.6325 24.1875 -12.3125 24.1875 C-12.3125 23.1975 -12.3125 22.2075 -12.3125 21.1875 C-12.951875 21.06375 -13.59125 20.94 -14.25 20.8125 C-15.2709375 20.503125 -15.2709375 20.503125 -16.3125 20.1875 C-17.51522819 17.78204362 -17.41321472 16.23753047 -17.375 13.5625 C-17.36597656 12.74523438 -17.35695313 11.92796875 -17.34765625 11.0859375 C-17.33605469 10.45945312 -17.32445312 9.83296875 -17.3125 9.1875 C-16.67183594 9.07148438 -16.03117187 8.95546875 -15.37109375 8.8359375 C-14.69175781 8.62195312 -14.01242188 8.40796875 -13.3125 8.1875 C-13.003125 7.40375 -12.69375 6.62 -12.375 5.8125 C-10.12962936 0.26511373 -5.4692016 -0.18030335 0 0 Z ' fill='%23E1E3E5' transform='translate(22.3125,15.8125)'/%3E%3Cpath d='M0 0 C0 2.31 0 4.62 0 7 C0.66 7 1.32 7 2 7 C2 4.69 2 2.38 2 0 C2.99 0.33 3.98 0.66 5 1 C5.3125 3.6875 5.3125 3.6875 5 7 C2.6875 9.875 2.6875 9.875 0 12 C-0.99 12 -1.98 12 -3 12 C-4.52491998 8.95016004 -4.23562548 6.3576631 -4 3 C-1.77419355 0 -1.77419355 0 0 0 Z ' fill='%23122B5D' transform='translate(17,26)'/%3E%3Cpath d='M0 0 C0 1.32 0 2.64 0 4 C-0.66 4 -1.32 4 -2 4 C-2 4.99 -2 5.98 -2 7 C-1.01 7.33 -0.02 7.66 1 8 C1 8.33 1 8.66 1 9 C-1.97 9 -4.94 9 -8 9 C-6.68 8.34 -5.36 7.68 -4 7 C-4 6.01 -4 5.02 -4 4 C-4.66 4 -5.32 4 -6 4 C-6 2.68 -6 1.36 -6 0 C-3.50907189 -1.24546405 -2.58919267 -0.7767578 0 0 Z ' fill='%232881C5' transform='translate(31,7)'/%3E%3Cpath d='M0 0 C0.99 0 1.98 0 3 0 C3 4.29 3 8.58 3 13 C2.01 12.67 1.02 12.34 0 12 C-1.1898306 9.6203388 -1.13349966 8.08514265 -1.125 5.4375 C-1.12886719 4.22900391 -1.12886719 4.22900391 -1.1328125 2.99609375 C-1 1 -1 1 0 0 Z ' fill='%2332B6EF' transform='translate(6,24)'/%3E%3Cpath d='M0 0 C3.53571429 0.53571429 3.53571429 0.53571429 5 2 C5.04092937 4.33297433 5.04241723 6.66705225 5 9 C4.34 9 3.68 9 3 9 C2.67 7.02 2.34 5.04 2 3 C1.67 3 1.34 3 1 3 C0.67 4.98 0.34 6.96 0 9 C-0.66 9 -1.32 9 -2 9 C-2.125 5.625 -2.125 5.625 -2 2 C-1.34 1.34 -0.68 0.68 0 0 Z ' fill='%2335BAF7' transform='translate(34,24)'/%3E%3Cpath d='M0 0 C2.475 0.99 2.475 0.99 5 2 C5 4.31 5 6.62 5 9 C4.34 9 3.68 9 3 9 C2.87625 8.030625 2.7525 7.06125 2.625 6.0625 C2.315625 4.5465625 2.315625 4.5465625 2 3 C1.34 2.67 0.68 2.34 0 2 C0 4.31 0 6.62 0 9 C-0.66 9 -1.32 9 -2 9 C-2.125 5.625 -2.125 5.625 -2 2 C-1.34 1.34 -0.68 0.68 0 0 Z ' fill='%2335BBF8' transform='translate(19,24)'/%3E%3Cpath d='M0 0 C1.32 0.33 2.64 0.66 4 1 C4 4.63 4 8.26 4 12 C3.01 12 2.02 12 1 12 C0.67 8.04 0.34 4.08 0 0 Z ' fill='%232F7ADD' transform='translate(46,24)'/%3E%3Cpath d='M0 0 C-2.07143201 4.03384128 -3.96615872 5.92856799 -8 8 C-8.36075949 3.55063291 -8.36075949 3.55063291 -6.8125 1.1875 C-4.44017475 -0.36678206 -2.77958655 -0.22537188 0 0 Z ' fill='%23152E62' transform='translate(21,21)'/%3E%3Cpath d='M0 0 C0 2.64 0 5.28 0 8 C-1.98 8.99 -1.98 8.99 -4 10 C-4.36814024 3.49618902 -4.36814024 3.49618902 -2.5625 1.0625 C-1 0 -1 0 0 0 Z ' fill='%2306163E' transform='translate(17,26)'/%3E%3Cpath d='M0 0 C1.9453125 -0.29296875 1.9453125 -0.29296875 4.125 -0.1875 C5.40375 -0.125625 6.6825 -0.06375 8 0 C6.68 1.65 5.36 3.3 4 5 C2.02 4.34 0.04 3.68 -2 3 C-1.34 2.01 -0.68 1.02 0 0 Z ' fill='%23071B44' transform='translate(21,21)'/%3E%3Cpath d='M0 0 C1.32 0.33 2.64 0.66 4 1 C1.36 3.64 -1.28 6.28 -4 9 C-4.33 7.68 -4.66 6.36 -5 5 C-2.8125 2.1875 -2.8125 2.1875 0 0 Z ' fill='%23152E63' transform='translate(29,21)'/%3E%3Cpath d='M0 0 C1.98 0 3.96 0 6 0 C5.6875 1.9375 5.6875 1.9375 5 4 C4.01 4.33 3.02 4.66 2 5 C1.01 4.01 0.02 3.02 -1 2 C-0.67 1.34 -0.34 0.68 0 0 Z ' fill='%2330A9E4' transform='translate(25,32)'/%3E%3Cpath d='M0 0 C-6.625 3 -6.625 3 -10 3 C-10 2.01 -10 1.02 -10 0 C-3.375 -1.125 -3.375 -1.125 0 0 Z ' fill='%23D4D6D7' transform='translate(36,46)'/%3E%3C/svg%3E");
        }

        .n8n-bot-message-container {
            margin-top: 20px;
            display: table-column;
            position: relative;
            margin-bottom: 10px;
            background: var(--chat--color-background);
        }



        .n8n-message-footer {
            margin-left: 40px;
            margin-top: 4px;
            display: flex;
            gap: 10px;
            justify-content: flex-start;
            opacity: 0;
            transition: opacity 0.2s;
            background: none;
            margin: 5px 10px 0;
        }

        .n8n-bot-message-container:hover .n8n-message-footer {
            opacity: 1;
        }

        .n8n-message-footer button {
            background: none;
            border: none;
            cursor: pointer;
            /* // padding: 5px; */
            display: flex;
            align-items: center;
            justify-content: center;
            /* // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            // border-radius: 50%; */
            transition: transform 0.1s ease, box-shadow 0.1s ease;
            color: #666;
        }

        .n8n-message-footer button:hover {
            transform: translateY(-2px);
            /* // box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); */
        }

        .n8n-message-footer button svg {
            width: 15px;
            height: 15px;
            fill: #666;
            right: 40px;
        }

        .n8n-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px 10px;
            background:  #ffffff;
            display: flex;
            flex-direction: column;
            gap: 5px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
            /* // padding-top: 20px; */
            border-radius: 20px 20px 0 0;
        }



        .n8n-chat-message {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin: 8px 0;
        }

        .n8n-chat-message.user {
            flex-direction: row-reverse;
            align-self: flex-end;
            gap: 0;
        }

        .n8n-chat-message.bot {
            flex-direction: column;
            align-self: flex-start;
        }

        .n8n-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            flex-shrink: 0;
            display: none;
        }

        .n8n-message-bubble {        
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px;
            background: #f1f1f1;
            border-radius: 8px;
        }

        .n8n-chat-message.user{
            max-width: 100%;
        }

        .n8n-chat-message.user .n8n-message-bubble-user {
            white-space: pre-wrap;
            padding: 8px 12px;
            background: transparent linear-gradient(153deg, #DDF1FF 0%, #FFD8A3 100%) 0% 0% no-repeat padding-box;
            color: #122646;
            border-radius: 20px 0px 20px 20px;
            max-height: 100%;
            word-wrap: break-word;
            font-size: 13px;
            /* // line-height: 1.4; */
            margin: 25px 0 0 ;
            min-width: 40px;
            /* // display: inline-block; */
        }

        .n8n-message-bubble ul {
            list-style-type: disc;
            padding-left: 20px;
            margin: 5px 0;
        }

        .n8n-message-bubble li {
            margin-bottom: 5px;
            font-size: 13px;
            /* // line-height: 1.5; */
            color: var(--chat--color-font);
        }

        .n8n-message-bubble div {
            margin-bottom: 5px;
            font-size: 13px;
            /* // line-height: 1.5; */
            color: var(--chat--color-font);
        }

        .n8n-chat-message.user .n8n-message-bubble {
            white-space: pre-wrap;
            padding: 8px 12px;
            border-radius: 12px 12px 0 12px;
        }

        .n8n-chat-message.bot .n8n-message-bubble {
            padding: 8px 12px;
            border-radius: 0px 20px 20px 20px;
            max-Width : 90%;
            width : 100%;
            background: #ffffff;
            color: #122646; 
            font-size: 13px;
            border: 1px solid #E5E5E5;
        }

        .n8n-chat-message.bot .n8n-message-bubble-table {
            margin-top: -15px;
            padding: 8px 12px;
            border-radius: 0 0 12px 12px;
            max-Width : 90%;
            width : 100%;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            background: #f1f1f1;
        }

        .n8n-chat-message.bot .n8n-message-bubble-dropdown {
            margin-top: -15px;
            padding: 10px 12px;
            border-radius: 0 0 12px 12px;
            max-Width : 90%;
            width : 100%;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px,20px,20px,20px;
            background: #f1f1f1;
        }

        .n8n-chat-message.bot .n8n-message-bubble-dropdown select {
            width: 100%;
            padding: 5px;
            border-radius: 4px;
            border: 1px solid #ddd;
            background:  #fff;
            font-size: 13px;
        }


        .n8n-chat-message.user .n8n-message-bubble::after,
        .n8n-chat-message.bot .n8n-message-bubble::before {
            content: none;
        }


        .n8n-chat-input {
            /* // margin-bottom: -10px; */
            padding: 5px 12px;
            border-top: 1px solid rgba(133, 79, 255, 0.2);
            position: relative;
            flex-shrink: 0; /* Prevent it from shrinking in full-screen */ 
            background: #ffffff;
            border: none;
            border-radius: 0 0 17px 17px;
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-height: none; /* Allow it to grow in full-screen */
        }


        .n8n-input-row {
            display: flex;
            gap: 8px;
            width: 100%;
            align-items: center;
        }

        .n8n-textarea-wrapper {
            position: relative;
            flex: 1;
        }

        .n8n-chat-input textarea {
            height : 50px !important;
            flex: 1;
            height: 100%;
            padding: 16px 45px 13px 45px;
            border: 1px solid #E5E5E599;
            border-radius: 10px;
            background: #E3F4FF;
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 12px;
            width: 100%;
            box-sizing: border-box;
            max-height: 120px;
            overflow-y: auto;
            min-height: 40px;        
        }

        /* //  .n8n-chat-input textarea:focus {
        //     border: 1px solid #000000;
        //     outline: none;
        // } */

        .n8n-chat-input textarea:focus-visible{
            outline: none;
        }

        .n8n-chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }

        .n8n-chat-input .n8n-send-button {
            background-color: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            /* // width: 32px; */
            /* // height: 32px; */
            border-radius: 50%;
            position: absolute;
            right: 19px;
            top: 47%;
            transform: translateY(-50%);
        }

        .n8n-mic-button {

            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 8px;
            position: absolute;
            right: 5px;
            top: 47%;
            transform: translateY(-50%);
        }

        .n8n-mic-button.n8n-recording {
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.1); }
            100% { transform: translateY(-50%) scale(1); }
        }

        .n8n-chat-branding-message .n8n-chat-avatar-container{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            /* // margin: 20px 0 40px 0; */
            text-align: center;
            flex-grow: 1;
        }

        .n8n-chat-branding-message img {
            width: 64px;
            height: 64px;
            margin-bottom: 8px;
            border-radius: 50%;
            background-color: #ffffff;
        }

        .n8n-chat-branding-message span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        .n8n-file-upload-button {
            margin-left: 9px;
            margin-right: -10px;
            margin-top: -1px;
            background: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            font-size: 20px;
            color: white;
            position: absolute;
            left: 5px;
            top: 50%;
            transform: translateY(-50%);
            transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .n8n-file-upload-button:hover { 
            transform: translateY(-50%) scale(1.1);
        }

        .n8n-file-input {
            display: none;
        }

        .n8n-file-preview {
            display: flex;
            align-items: center;
            background: rgba(133, 79, 255, 0.1);
            padding: 8px 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            font-size: 12px;
            max-width: 90%;
            box-sizing: border-box;
            overflow: hidden;
            word-break: break-all;
        }        

        .n8n-file-preview.audio {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;
            background: rgba(133, 79, 255, 0.2);
        }

        .n8n-file-preview.audio audio {
            width: 100%;
            height: 40px;
        }

        .n8n-file-preview-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            vertical-align: middle;
            word-break: break-all;
        }

        .n8n-file-preview-remove {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--chat--color-font);
            opacity: 0.7;
            margin-left: 8px;
            padding: 2px 6px;
            border-radius: 4px;
        }

        .n8n-file-preview-remove:hover {
            background: rgba(133, 79, 255, 0.2);
            opacity: 1;
        }

        .n8n-chat-footer {
            padding: 4px;
            text-align: center;
            background: var(--chat--color-background);
            display: none;
        }

        .n8n-chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }

        .n8n-chat-footer a:hover {
            opacity: 1;
        }

        .n8n-chat-toggle {
            position: fixed;
            bottom: 33px;
            right: 53px;
            width: auto;
            height: 50px;
            border-radius: 999px;
            background: transparent linear-gradient(109deg, #103278 0%, #5C006B 100%) 0% 0% no-repeat padding-box;
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 15px 0 5px;
            font-size: 13px;
            font-weight: 500;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            gap: 10px;
            min-width: 120px;
        }

        .n8n-chatbot-tail {
            position: absolute;
            bottom: -8px;
            right: 30px;
            width: 0;
            height: 0;
            border-left: 0 solid transparent;
            border-right: 10px solid transparent;
            border-top: 8px solid #6a1b9a;
        }


        .n8n-chat-toggle::after {
            content: "Ask AARYA";
            white-space: nowrap;
            font-weight: normal;
        }


        .n8n-chat-toggle.position-left {
            right: auto;
            left: 20px;
        }

        .n8n-chat-toggle:hover {
            transform: scale(1.05);
        }

        .n8n-chat-toggle svg {
            width: 32px;
            height: 32px;
            fill: currentColor;
            flex-shrink: 0;
            border-radius: 50%;
        }

        .n8n-dialog-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            z-index: 1000;
            transition: opacity 0.2s ease;
        }

        .n8n-loading-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            margin: 8px 0;
            align-self: flex-start;
            padding: 12px 16px;
            background: #F3F4F6;
            border-radius: 12px 12px 12px 0;
            max-width: 80%;
        }

        .n8n-loading-indicator .dot {
            width: 8px;
            height: 8px;
            background: #666;
            border-radius: 100%;
            animation: bounce 1.2s infinite;
        }

        .n8n-loading-indicator .dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .n8n-loading-indicator .dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-8px);
            }
            60% {
                transform: translateY(-4px);
            }
        }

        .n8n-message-bubble img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 5px;
        }

        .n8n-chat-message.user .n8n-message-bubble:has(img) {
            background: transparent;
            padding: 0;
        }

        .n8n-chat-message.user .n8n-message-bubble div {
            background: #007BFF;
            padding: 12px 16px;
            border-radius: 12px 12px 0 12px;
        }

        .n8n-message-bubble audio {
            width: 100%;
            height: 40px;
            background: rgb(249, 248, 237);
            border-radius: 8px;
            margin: 5px 0;
        }

        .n8n-chat-message.user .n8n-message-bubble audio {
            background: rgba(255, 255, 255, 0.2);
        }

        .n8n-file-message {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #007BFF;
            color: #fff;
            border-radius: 16px;
            padding: 10px 18px;
            max-width: 100%;
            min-width: 100px;
            margin: 8px 0;
            box-sizing: border-box;
            overflow: hidden;
            word-break: break-all;
            display: inline-block;
        }

        .n8n-file-message .n8n-file-icon {
            width: 20px;
            height: 20px;
            fill: #fff;
            flex-shrink: 0;
        }

        .n8n-file-message span {
            display: inline-block;
            max-width: 160px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle;
            word-break: break-all;
        }

        .n8n-chat-code-block {
            background: #23272e;
            color: #f8f8f2;
            border-radius: 6px;
            padding: 12px;
            margin: 8px 0;
            font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-all;
            max-width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
        }

        .n8n-chat-code-block-wrapper {
            position: relative;
        }

        .n8n-copy-code-btn {
            position: absolute;
            top: 8px;
            right: 12px;
            background: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 2px 10px;
            font-size: 12px;
            cursor: pointer;
            z-index: 2;
            opacity: 0.85;
            transition: opacity 0.2s;
        }

        .n8n-copy-code-btn:hover {
            opacity: 1;
        }

        .n8n-copy-code-btn.n8n-copied svg rect {
            stroke: #007bff;
        }

        .n8n-file-preview {
            max-width: 90%;
            box-sizing: border-box;
            overflow: hidden;
            word-break: break-all;
        }

        .n8n-file-preview-name {
            display: inline-block;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle;
            word-break: break-all;
            padding: 10px 0 0 10px;
            font-size: 14px;
            position: relative;
        }

        .n8n-resize-handle {
            position: absolute;
            left: 0;
            top: 0;
            width: 18px;
            height: 18px;
            cursor: nwse-resize;
            z-index: 10;
            background: transparent;
        }

        .n8n-resize-handle::after {
            content: '';
            display: block;
            width: 14px;
            height: 14px;
            border-top: 2px solid #103278;
            border-left: 2px solid #103278;
            border-radius: 4px 0 0 0;
            position: absolute;
            left: 1px;
            top: 2px;
        }
        .n8n-message-actions {
            display: flex;
            gap: 8px;
            margin-top: 4px;
            opacity: 0.5;
            transition: opacity 0.2s;
        }

        .n8n-message-actions button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--chat--color-font);
            transition: background-color 0.2s;
        }

        .n8n-message-actions button:hover {
            opacity: 1;
            background-color: #555555; /* Darker shade on hover for feedback */
        }

        .n8n-message-actions button:active {
            background-color: #007BFF; /* Blue background color on click */
            color: #ffffff; /* Optional: Change text/icon color to white for contrast */
        }

        .n8n-csv-expand-button {
            background: var(--chat--color-primary);
            color: #ffffff;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 8px;
            transition: background 0.2s;
        }

        .n8n-csv-expand-button:hover {
            background: var(--chat--color-secondary);
        }

        .n8n-csv-modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4); /* Semi-transparent backdrop */
            z-index: 1001;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto; /* Ensure backdrop can scroll if modal overflows */
        }

        .n8n-csv-modal {
            background: #ffffff;
            border-radius: 8px;
            padding: 24px;
            width: auto;
            max-width: 90vw; /* Maximum width of 90% of viewport width */
            max-height: 90vh; /* Maximum height of 90% of viewport height */
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* Subtle shadow for depth */
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .n8n-csv-modal-close {
            position: absolute;
            top: 12px;
            right: 12px;
            background: none;
            border: none;
            font-size: 28px;
            color: #5f6368; /* Google Sheets close button color */
            cursor: pointer;
            /* // line-height: 1; */
            transition: color 0.2s;
        }

        .n8n-csv-modal-close:hover {
            color: #d93025; /* Google Sheets close button hover color */
        }

        .n8n-table-container {
            max-width: 340px; /* Constrain width in widget */
            overflow-x: auto; /* Allow horizontal scrolling in widget */
        }



        /* Fullscreen Table Popup Styles */
        .n8n-dialog-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .n8n-table-dialog {
            position: relative;
            width: 95vw;
            height: 90vh;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            max-width: none;
            max-height: none;
            overflow: hidden;
            z-index: 10000;
        }

        .n8n-table-dialog .n8n-dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            flex-shrink: 0;
        }

        .n8n-table-dialog h3 {
            margin: 0;
            font-size: 24px;
            color: #333;
            font-weight: 600;
        }

        .n8n-dialog-close-button {
            background: none;
            border: none;
            font-size: 32px;
            cursor: pointer;
            color: #666;
            padding: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .n8n-dialog-close-button:hover {
            background-color: #f0f0f0;
            color: #333;
        }

        .n8n-table-dialog .n8n-table-container {
            flex: 1;
            overflow: auto;
            padding: 20px;
            max-width: none;
        }

        .n8n-table-dialog table {
            width: 100%;
            box-sizing: border-box;
            border-collapse: collapse;
            margin-left: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            font-size: 13px;
        }

        .n8n-table-dialog thead {
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .n8n-table-dialog th {
            padding: 12px 16px;
            background-color: #f8f9fa;
            font-size: 16px;
            font-weight: 600;
            color: #495057;
            text-align: left;
            border: 1px solid #dee2e6;
            white-space: normal;
            word-break: break-word;
        }

        .n8n-table-dialog td {
            padding: 12px 16px;
            font-size: 16px;
            border: 1px solid #dee2e6;
            white-space: normal;
            word-break: break-word;
            color: #495057;
            vertical-align: top;
        }

        .n8n-table-dialog tbody tr {
            transition: background-color 0.15s ease;
        }

        .n8n-table-dialog tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .n8n-table-dialog tbody tr:nth-child(odd) {
            background-color: #ffffff;
        }

        .n8n-table-dialog tbody tr:hover {
            background-color: #e3f2fd !important;
        }

        /* Ellipsis cells styling */
        .n8n-table-dialog td.ellipsis {
            text-align: center;
            color: #888;
            font-style: italic;
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 768px) {
            .n8n-table-dialog {
                width: 98vw;
                height: 95vh;
                border-radius: 8px;
            }
            
            .n8n-table-dialog .dialog-header {
                padding: 15px 20px;
            }
            
            .n8n-table-dialog h3 {
                font-size: 20px;
            }
            
            .n8n-dialog-close-button {
                font-size: 28px;
                width: 35px;
                height: 35px;
            }
            
            .n8n-table-dialog .n8n-table-container {
                padding: 15px;
            }
            
            .n8n-table-dialog th,
            .n8n-table-dialog td {
                padding: 8px 12px;
                font-size: 13px;
            }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
            .n8n-table-dialog {
                width: 100vw;
                height: 100vh;
                border-radius: 0;
            }
            
            .n8n-table-dialog th,
            .n8n-table-dialog td {
                padding: 6px 8px;
                font-size: 12px;
            }
        }

        .n8n-dialog-close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #333;
            flex-shrink: 0; /* Prevent the close button from shrinking */
        }
        .n8n-message-content {
            max-width: 600px;
            min-width: 200px;

        }

        .n8n-message-content.typing::after {
            content: '|';
            animation: blink 0.7s infinite;
            display: inline-block;
            color: var(--chat--color-font);
            font-family: var(-fira-font);
        }
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }

        .n8n-dialog-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9998;
        }

        .n8n-image-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            background: white;
            padding: 0;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            max-width: 95vw;
            max-height: 95vh;
            overflow: auto;
        }

        .n8n-dialog-close-button {
            background: white;
            border: none;
            font-size: 24px;
            padding: 8px 12px;
            cursor: pointer;
            align-self: flex-end;
        }

        .n8n-responsive-popup-image {
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 0 0 12px 12px;
        }

        /* Avatar container positioned below header */
        #n8n-chat-avatar-container {
            width: 100%;
            height: 180px; /* Less than half of typical chat widget height */
            max-height: 40vh; /* Responsive height limit */
            margin: 0;
            overflow: hidden;
            background: transparent;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            position: relative;
            box-sizing: border-box;
        }

        #n8n-chat-avatar-container canvas {
            width: 100% !important;
            height: 100% !important;
            display: block;
            object-fit: cover;
        }

        /* Branding message container */
        .n8n-chat-branding-message {
            width: 100%;
            margin: 0;
            padding: 0;
            background: #ffffff;
            border-bottom: 1px solid #e0e0e0;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        /* Ensure messages container accounts for avatar space */
        .n8n-messages-container {
            padding-top: 0; /* Remove top padding since avatar is positioned */
        }

        /* Make sure avatar doesn't interfere with chat messages */
        .message {
            margin-top: 10px;
        }

        /* For smaller screens, reduce avatar height further */
        @media (max-height: 600px) {
            #n8n-chat-avatar-container {
                height: 120px;
                max-height: 30vh;
            }
        }

        /* Compact mode for very small screens */
        @media (max-height: 400px) {
            #n8n-chat-avatar-container {
                height: 80px;
                max-height: 25vh;
            }
        }


        .n8n-toggle-switch {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .n8n-toggle-switch .n8n-toggle-label {
            position: absolute;
            right: 115px;
            color: #ffffff;
            font-size: 10px;
            letter-spacing: 0.5px;
        }

        .n8n-toggle-switch .n8n-toggle-input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .n8n-toggle-switch .n8n-toggle-slider {
            position: absolute;
            right: 75px;
            display: inline-block;
            width: 35px;
            height: 15px;
            background-color: #ccc;
            border-radius: 20px;
            cursor: pointer;
            transition: 0.4s;
        }

        .n8n-toggle-switch .n8n-toggle-slider:before {
            content: "";
            position: absolute;
            height: 12px;
            width: 13px;
            left: 2px;
            bottom: 1.6px;
            background-color: white;
            border-radius: 50%;
            transition: 0.4s;
        }

        .n8n-toggle-switch .n8n-toggle-input:checked + .n8n-toggle-slider {
            background-color: #4CAF50;
        }

        .n8n-toggle-switch .n8n-toggle-input:checked + .n8n-toggle-slider:before {
            transform: translateX(18px);
        }



        /* //  .n8n-brand-header button:hover {
        //     color: #ddd;
        // } */



        .n8n-chat-branding-message-video-off {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 20px 0 40px 0;
            text-align: center;
            display: none;
        }

        .n8n-chat-branding-message-video-off img {
            width: 50px;
            height: 50px;
            margin-bottom: 8px;
            border-radius: 50%;
            background-color: #ffffff;
        }

        .n8n-chat-branding-message-video-off span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }

        .n8n-message-bubble div.n8n-message-bot-who, div.n8n-message-bot-who {
            padding-right: 5px;
            font-size: 10px;
            margin-bottom: 0;
            font-weight: 600; 
        }

        div.n8n-message-bot-who {
            padding-left: 3px;
        }

        @media (max-width: 500px) {


        .n8n-chat-header {
        height: 50px;
        flex-shrink: 0;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        z-index: 10;
        }

        .n8n-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        background: #ffffff;
        }

        .n8n-chat-input-wrapper {
            flex-shrink: 0;
            padding: 10px;
            background: #fff;
            border-top: 1px solid #ddd;
            z-index: 10;
        }

        textarea,
        input {
            font-size: 16px; /* Prevent iOS zoom */
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #ccc;
            resize: none;
            line-height: 1.4;
            outline: none;
        }

        }

        #trulience-iframe{
            border-radius: 20px 20px 0 0 !important;
        }


        /* Image Popup Styles */
        .n8n-dialog-backdrop {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: rgba(0, 0, 0, 0.8) !important;
            z-index: 9999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            backdrop-filter: blur(2px) !important;
            animation: fadeIn 0.2s ease-out !important;
        }

        .n8n-image-dialog {
            position: relative !important;
            max-width: 90vw !important;
            max-height: 90vh !important;
            background: white !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
            overflow: hidden !important;
            animation: scaleIn 0.2s ease-out !important;
        }

        .n8n-dialog-close-button {
            position: absolute !important;
            top: 15px !important;
            right: 15px !important;
            background: rgba(0, 0, 0, 0.6) !important;
            color: white !important;
            border: none !important;
            border-radius: 50% !important;
            width: 40px !important;
            height: 40px !important;
            cursor: pointer !important;
            font-size: 20px !important;
            font-weight: bold !important;
            line-height: 1 !important;
            z-index: 10001 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
        }

        .n8n-dialog-close-button:hover {
            background: rgba(0, 0, 0, 0.8) !important;
            transform: scale(1.1) !important;
        }

        .n8n-dialog-close-button:active {
            transform: scale(0.95) !important;
        }

        .n8n-responsive-popup-image {
            max-width: 90vw !important;
            max-height: 90vh !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            display: block !important;
            border-radius: 12px !important;
        }

        /* Image preview cursor */
        .n8n-image-preview {
            cursor: pointer !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }

        .n8n-image-preview:hover {
            transform: scale(1.02) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        /* Animations */
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
            .n8n-dialog-backdrop {
                padding: 20px !important;
            }
            
            .n8n-image-dialog {
                max-width: 95vw !important;
                max-height: 85vh !important;
            }
            
            .n8n-responsive-popup-image {
                max-width: 95vw !important;
                max-height: 85vh !important;
            }
            
            .n8n-dialog-close-button {
                top: 10px !important;
                right: 10px !important;
                width: 35px !important;
                height: 35px !important;
                font-size: 18px !important;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .n8n-image-dialog {
                background: #2a2a2a !important;
            }
        }

        /* Loading state */
        .n8n-popup-loading {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 200px !important;
            color: #666 !important;
        }

        .n8n-popup-loading::after {
            content: "Loading..." !important;
            animation: pulse 1.5s ease-in-out infinite !important;
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 0.5;
            }
            50% {
                opacity: 1;
            }
        }

        .n8n-fullscreen-button {
            position: absolute;
            right: 42%; /* Adjusted to place it to the left of the refresh button (48px + 28px) */
            top: 47%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #ffffff !important;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
            border-radius: 50%;
            width: auto;
            height: auto;
        }

        .n8n-full-window-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            }

        .n8n-popup-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 1000px;
            max-height: 90vh;
            overflow: auto;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        }

        .n8n-popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            position: sticky;
            top: 0;
            background: white;
        }

        .n8n-popup-header h3 {
            margin: 0;
        }

        .n8n-popup-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            line-height: 1;
        }

        .n8n-popup-body {
            
        }
        
        
        @media (max-width: 500px) {
        .n8n-chat-widget .chat-iframe,
        .n8n-chat-widget .chat-iframe.open {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            /* Use the dynamic vh unit */
            height:  calc(var(--vh, 1vh) * 100); /* dynamic height */
            max-height: calc(var(--vh, 1vh) * 100);
            

            width: 100vw;
            max-width: 100vw;

            border-radius: 0;
            box-shadow: none;
            border: none;

            padding: 0;
            font-size: 16px;
        }
        textarea,
        input {
            font-size: 16px; /* Prevent iOS zoom */
        }
        .n8n-chat-widget .chat-iframe {
            overscroll-behavior: contain;
            touch-action: manipulation;
        }

        .n8n-chat-header {
            height: 50px;
            flex-shrink: 0;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            padding: 0 12px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            z-index: 10;
        }

        .n8n-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background: #ffffff;
            
            /* Ensure proper scrolling behavior */
            scrollbar-width: thin; /* For Firefox */
            scrollbar-color: rgba(57, 56, 56, 0.3) transparent;
        }

        .n8n-chat-input-wrapper {
            flex-shrink: 0;
            padding: 10px;
            background: #fff;
            border-top: 1px solid #ddd;
            z-index: 10;
        }

        textarea,
        input {
            font-size: 16px; /* Prevent iOS zoom */
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #ccc;
            resize: none;
            line-height: 1.4;
            outline: none;
        }
        
        // .n8n-fullscreen-button {
        //     display: none; /* Hide fullscreen button on mobile */
        // }
    }
        
    // .n8n-resize-handle {
    //     position: absolute;
    //     left: 0;
    //     top: 0;
    //     width: 18px;
    //     height: 18px;
    //     cursor: nwse-resize;
    //     z-index: 10;
    //     background: transparent;
    // }

    // .n8n-resize-handle::after {
    //     content: '';
    //     display: block;
    //     width: 14px;
    //     height: 14px;
    //     border-top: 2px solid #103278;
    //     border-left: 2px solid #103278;
    //     border-radius: 4px 0 0 0;
    //     position: absolute;
    //     left: 1px;
    //     top: 2px;
    // }

    .n8n-chat-widget .chat-iframe {
        will-change: width, height, left, top;
        contain: layout style paint;
        transform: translateZ(0);
        backface-visibility: hidden;
    }
    
    .n8n-chatbot-version {
        color: #828588;
        top: 5px;
        right: 10px;
        position: relative;
        font-size: 0.6em;
        opacity: 0.3;
        margin-top: 2px;
    }




    `;
    

    // Create iframe content
    const iframeContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css">
            <style>${iframeStyles}</style>
        </head>
        <body>
        <div class="n8n-chat-container">
            <div class="n8n-chat-interface" id="n8n-chat-interface">
                <!-- Content will be dynamically inserted here -->
            </div>
        </div>
            




















            <script>

                let video = 'off'; // Default state

                // Declare all variables in global scope first
                window.video = 'off'; // Default state
                window.chatInitialized = false; // Track if chat has been initialized
                window.messagesLoaded = false; // Track if default messages have been loaded
                
                // Make them accessible without window prefix
                // var video = window.video;
                var chatInitialized = window.chatInitialized;
                var messagesLoaded = window.messagesLoaded;


                // Configuration variables
                // var TrulienceAvatarID= "2673128051696289574"; 
                // var TrulienceAvatarToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUb2tlbiBmcm9tIGN1c3RvbSBzdHJpbmciLCJleHAiOjQ4NzU0MDAzNTV9.g9knMTj1_lwt_QjAuVuXMjvHLLRnV3LADTQqPdzoDwMxcMhrCPLxRFm_29hYg3mEO2E4AT4KrPV1r7DCGTYQmg";  
    
                // const trulienceparams = "dialPageBackground=transparent&connect=true&hideFS=true&hideChatInput=true&hideLetsChatBtn=true&hideMicButton=true&hideToast=true&hideSpeakerButton=true";
                // const trulienceURL = \`https://trulience.com/avatar/\${TrulienceAvatarID}?token=\${TrulienceAvatarToken}&\${trulienceparams}\`;
                

                









                // Configuration passed from parent
                const config = ${JSON.stringify(config)};


                // Function to create the iframe div
                function createIframeDiv() {
                    return \`
                        <div id="trulience-container">
                            <iframe id="trulience-iframe"
                                src="\${trulienceURL}"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title="Trulience Avatar"
                                allow="autoplay; xr-spatial-tracking">
                            </iframe>
                        </div>
                    \`;
                }

                function updateIframeVisibility() {
                    const containerId = 'trulience-container';
                    const container = document.getElementById(containerId);
                    const headerDiv = document.querySelector('.n8n-brand-header');
                    const chatMessages = chatInterface.querySelector('.n8n-chat-messages');

                    if (!headerDiv || !chatMessages) {
                        console.error('Required elements (.n8n-brand-header or .n8n-chat-messages) not found.');
                        return;
                    }

                    if (video === 'on') {
                        // Update chat messages border-radius
                        chatMessages.style.setProperty('border-radius', '0 0 0 0', 'important');

                    // Add iframe if it doesn't exist
                    if (!container) {
                        const iframeHTML = createIframeDiv();
                        headerDiv.insertAdjacentHTML('afterend', iframeHTML);
                    }
                    // Show the container
                    const newContainer = document.getElementById(containerId);
                    if (newContainer) {
                        newContainer.style.display = 'block';
                    }
                    } else {
                        // Update chat messages border-radius
                        chatMessages.style.setProperty('border-radius', '20px 20px 0 0', 'important');

                        // Hide the container if it exists
                        if (container) {
                            container.style.display = 'none';
                        }
                    }
                }

                // // Set up toggle event listener
                // function setupToggleListener() {
                //     const toggleInput = document.getElementById('videoToggle');
                //     if (toggleInput) {
                //     // Set initial state
                //     updateIframeVisibility();

                //     // Add event listener
                //     toggleInput.addEventListener('change', () => {
                //         video = toggleInput.checked ? 'on' : 'off';
                //         // console.log('Video state:', video); // Debug
                //         updateIframeVisibility();
                //     });
                //     } else {
                //     console.warn('Video toggle input not found, retrying...');
                //     setTimeout(setupToggleListener, 100); // Retry after 100ms
                //     }
                // }

                // setupToggleListener()

                const defaultChatInterfaceHTML = \`
                    <div class="n8n-brand-header">
                        <span>
                            <svg width="105" height="28" viewBox="0 0 105 28" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <g clip-path="url(#clip0_269_24536)">
                                <path d="M49.2267 19.9712C49.1356 19.9717 49.0455 19.9482 48.966 19.9033C48.8865 19.8585 48.8203 19.7939 48.7731 19.7153L41.2613 7.19337L34.3408 18.8931H41.064C41.204 18.8931 41.3381 18.9488 41.4372 19.0483C41.5364 19.1479 41.5923 19.2833 41.5928 19.4243C41.5928 19.4943 41.5792 19.5633 41.5526 19.6279C41.526 19.6925 41.4873 19.7514 41.4382 19.8008C41.389 19.8502 41.3303 19.8893 41.2661 19.916C41.2019 19.9427 41.1334 19.9562 41.064 19.9561H33.4116C33.3183 19.9565 33.2267 19.9321 33.146 19.8848C33.0654 19.8375 32.9988 19.769 32.9531 19.687C32.9072 19.6051 32.8834 19.5126 32.8843 19.4185C32.8852 19.3244 32.9105 19.2324 32.958 19.1514L40.8057 5.89014C40.8521 5.81104 40.9184 5.74546 40.9976 5.69971C41.0768 5.65397 41.1661 5.6294 41.2574 5.62891C41.3486 5.62842 41.4383 5.65202 41.5177 5.69727C41.5971 5.74253 41.6635 5.80818 41.7101 5.88721L49.678 19.167C49.75 19.288 49.7718 19.4329 49.7381 19.5698C49.7044 19.7068 49.6184 19.8247 49.4987 19.898C49.416 19.9461 49.3222 19.9716 49.2267 19.9712Z" fill="#0099FF"/>
                                <path d="M68.1896 19.9712C68.0985 19.9717 68.0084 19.9482 67.9289 19.9033C67.8494 19.8585 67.7832 19.7939 67.736 19.7153L60.2242 7.19337L53.3037 18.8931H60.0269C60.1669 18.8931 60.3009 18.9488 60.4001 19.0483C60.4993 19.1479 60.5552 19.2833 60.5557 19.4243C60.5557 19.4943 60.5421 19.5633 60.5155 19.6279C60.4889 19.6925 60.4502 19.7514 60.4011 19.8008C60.3519 19.8502 60.2932 19.8893 60.229 19.916C60.1648 19.9427 60.0963 19.9562 60.0269 19.9561H52.3745C52.2812 19.9565 52.1896 19.9321 52.1089 19.8848C52.0283 19.8375 51.9617 19.769 51.916 19.687C51.8701 19.6051 51.8463 19.5126 51.8472 19.4185C51.8481 19.3244 51.8734 19.2324 51.9209 19.1514L59.7686 5.89014C59.815 5.81104 59.8813 5.74546 59.9605 5.69971C60.0396 5.65397 60.129 5.6294 60.2203 5.62891C60.3115 5.62842 60.4012 5.65202 60.4806 5.69727C60.56 5.74253 60.6264 5.80818 60.673 5.88721L68.6409 19.167C68.7129 19.288 68.7347 19.4329 68.701 19.5698C68.6673 19.7068 68.5813 19.8247 68.4615 19.898C68.3789 19.9461 68.2851 19.9716 68.1896 19.9712Z" fill="#0099FF"/>
                                <path d="M104.474 19.9712C104.383 19.9717 104.293 19.9482 104.213 19.9033C104.134 19.8585 104.067 19.7939 104.02 19.7153L96.5083 7.19337L89.5879 18.8931H96.3111C96.4511 18.8931 96.5851 18.9488 96.6843 19.0483C96.7835 19.1479 96.8394 19.2833 96.8399 19.4243C96.8399 19.4943 96.8262 19.5633 96.7996 19.6279C96.773 19.6925 96.7344 19.7514 96.6853 19.8008C96.6361 19.8502 96.5774 19.8893 96.5132 19.916C96.449 19.9427 96.3805 19.9562 96.3111 19.9561H88.6587C88.5654 19.9565 88.4737 19.9321 88.3931 19.8848C88.3125 19.8375 88.2459 19.769 88.2002 19.687C88.1543 19.6051 88.1305 19.5126 88.1314 19.4185C88.1322 19.3244 88.1576 19.2324 88.205 19.1514L96.0527 5.89014C96.0992 5.81104 96.1655 5.74546 96.2447 5.69971C96.3238 5.65397 96.4132 5.6294 96.5045 5.62891C96.5957 5.62842 96.6853 5.65202 96.7647 5.69727C96.8442 5.74253 96.9106 5.80818 96.9572 5.88721L104.925 19.167C104.997 19.288 105.019 19.4329 104.985 19.5698C104.952 19.7068 104.865 19.8247 104.746 19.898C104.663 19.9461 104.569 19.9716 104.474 19.9712Z" fill="#0099FF"/>
                                <path d="M79.8628 6.18164L83.608 12.4199L84.6128 14.0889" fill="#EDEDED"/>
                                <path d="M84.6121 14.6262C84.5212 14.6258 84.4324 14.6016 84.3533 14.5564C84.2742 14.5112 84.2079 14.4468 84.1609 14.3684L79.4099 6.46314C79.3373 6.34265 79.3149 6.19828 79.3479 6.06128C79.3808 5.92429 79.4661 5.80586 79.5854 5.73218C79.6446 5.69601 79.7103 5.67191 79.7787 5.66138C79.8472 5.65085 79.917 5.65394 79.9843 5.67066C80.0515 5.68738 80.1151 5.71762 80.1709 5.75904C80.2266 5.80046 80.2733 5.85258 80.309 5.91236L85.0658 13.8123C85.1372 13.9333 85.1586 14.0779 85.1249 14.2146C85.0913 14.3513 85.0057 14.4689 84.8865 14.5422C84.8046 14.5952 84.7094 14.6243 84.6121 14.6262Z" fill="#0099FF"/>
                                <path d="M82.2373 19.4438L90.0855 6.18164L82.2373 19.4438Z" fill="#EDEDED"/>
                                <path d="M82.2361 19.9811C82.1412 19.9811 82.048 19.9554 81.9661 19.9069C81.846 19.8344 81.7591 19.7171 81.7247 19.5803C81.6903 19.4435 81.7111 19.2984 81.7824 19.1769L89.6311 5.91621C89.7027 5.79504 89.8192 5.70724 89.9549 5.67255C90.0905 5.63786 90.2344 5.65906 90.3547 5.73115C90.4143 5.76687 90.4665 5.81431 90.5079 5.87031C90.5493 5.9263 90.5796 5.9896 90.5966 6.05732C90.6136 6.12504 90.6169 6.19574 90.6068 6.26484C90.5967 6.33394 90.5731 6.40023 90.5375 6.46015L82.6898 19.7233C82.6431 19.8025 82.5764 19.868 82.4969 19.9133C82.4173 19.9585 82.3275 19.9818 82.2361 19.9811Z" fill="#0099FF"/>
                                <path d="M76.229 20.0004C76.138 20.0011 76.0483 19.9777 75.9687 19.933C75.8892 19.8883 75.8226 19.8235 75.7754 19.745L72.1552 13.6933C72.1069 13.613 72.0805 13.521 72.0791 13.4272C72.0777 13.3333 72.1011 13.2408 72.1469 13.1591C72.1926 13.0772 72.2587 13.0093 72.3389 12.9613C72.419 12.9134 72.5103 12.8873 72.6035 12.8861C72.7484 12.8861 76.1772 12.8133 76.1772 9.8383C76.1866 9.43523 76.1148 9.0343 75.9658 8.66007C75.8169 8.28585 75.5942 7.94595 75.311 7.66105C75.0278 7.37615 74.69 7.15238 74.3184 7.00285C73.9467 6.85331 73.5489 6.78143 73.1488 6.79142H68.7104C68.6409 6.79129 68.5721 6.77737 68.5078 6.75041C68.4436 6.72344 68.3853 6.68389 68.3363 6.63419C68.2872 6.5845 68.2483 6.52569 68.2219 6.46085C68.1955 6.39602 68.1819 6.32634 68.1821 6.25626C68.1824 6.11534 68.2382 5.98033 68.3372 5.88078C68.4362 5.78122 68.5706 5.7255 68.7104 5.7255H73.1536C73.694 5.70885 74.2322 5.80352 74.7347 6.00431C75.2373 6.2051 75.6932 6.50774 76.0754 6.89298C76.4575 7.27823 76.7576 7.73814 76.9566 8.24455C77.1555 8.75095 77.2493 9.29296 77.2323 9.83732C77.2323 12.5373 75.117 13.5891 73.49 13.8681L76.6754 19.1943C76.7114 19.2541 76.7353 19.3208 76.7457 19.3901C76.7561 19.4593 76.7528 19.5296 76.736 19.5976C76.7192 19.6655 76.6892 19.7293 76.6478 19.7856C76.6064 19.8418 76.5543 19.8893 76.4946 19.9252C76.4143 19.974 76.3228 20.0001 76.229 20.0004Z" fill="#FF9300"/>
                                <path d="M26.8017 0H0V28H26.8017V0Z" fill="url(#pattern0_269_24536)"/>
                                </g>
                                <defs>
                                <pattern id="pattern0_269_24536" patternContentUnits="objectBoundingBox" width="1" height="1">
                                <use xlink:href="#image0_269_24536" transform="scale(0.00444444 0.00446429)"/>
                                </pattern>
                                <clipPath id="clip0_269_24536">
                                <rect width="105" height="28" fill="white"/>
                                </clipPath>
                                <image id="image0_269_24536" width="225" height="224" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
                                </defs>
                            </svg>
                        </span>
                        <div class="n8n-chatbot-version">
                            v1.0.4
                        </div>
                        <button class="n8n-fullscreen-button" title="Toggle Fullscreen">
                            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="9" viewBox="0 0 38 9">
                            <g id="Group_83673" data-name="Group 83673" transform="translate(0 9) rotate(-90)" opacity="0.22" fill="#ffffff">
                                <path d="M7.5,21a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M1.5,21a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M7.5,7a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M7.5,28a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M1.5,7a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M1.5,28a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M7.5,14a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M7.5,35a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M1.5,14a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                                <path d="M1.5,35a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" transform="translate(-1.5 0)" />
                            </g>
                            </svg>
                        </button>
                    
                        <button class="n8n-refresh-button" title="Refresh chat">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                            </svg>
                        </button>
                        <button class="n8n-close-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="6" viewBox="0 0 15 6">
                                <g id="Group_83625" data-name="Group 83625" opacity="0.437">
                                <rect id="Rectangle_31702" data-name="Rectangle 31702" width="15" height="2" fill="#fff"/>
                                <g id="Rectangle_31703" data-name="Rectangle 31703" transform="translate(0 1)" fill="none" stroke="#fff" stroke-width="1">
                                <rect width="15" height="5" stroke="none"/>
                                <rect x="0.5" y="0.5" width="14" height="4" fill="none"/>
                                </g>
                            </g>
                            </svg>
                        </button>
                    </div>
                    <div class="n8n-chat-messages"></div>
                    <div class="n8n-chat-input">
                        <div id="n8n-file-preview-container"></div>
                        <div class="n8n-input-row">
                            <div class="n8n-textarea-wrapper">
                                <textarea id="n8n-chat-textarea" placeholder="Type your message.." rows="1"  ></textarea>
                                <button class="n8n-file-upload-button" title="Upload file">
                                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                        width="20" height="20" viewBox="0 0 512.000000 512.000000"
                                        preserveAspectRatio="xMidYMid meet">
                                        <metadata>
                                        Created by potrace 1.16, written by Peter Selinger 2001-2019
                                        </metadata>
                                        <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                        fill="#0099ff" stroke="none">
                                        <path d="M3880 4679 c-103 -14 -254 -67 -353 -125 -75 -44 -169 -136 -1103 -1069 -880 -879 -1025 -1028 -1051 -1080 -56 -110 -68 -160 -68 -285 0 -144    23 -226 96 -334 111 -167 281 -256 489 -256 110 0 190 19 285 68 63 32 129 95 703 666 349 347 643 644 654 659 90 124 -18 290 -169 262 -34 -6 -113 -81
                                        -678 -645 -489 -488 -651 -644 -685 -659 -59 -27 -160 -28 -215 -2 -95 44
                                        -160 151 -153 250 2 31 14 76 26 101 16 33 281 304 1009 1031 915 913 993 988
                                        1059 1022 87 45 176 67 269 67 358 0 637 -331 571 -679 -9 -48 -31 -115 -52
                                        -160 -36 -74 -62 -101 -1263 -1304 -674 -676 -1255 -1251 -1291 -1278 -82 -62
                                        -202 -122 -305 -151 -107 -30 -342 -33 -450 -5 -170 45 -368 169 -470 295
                                        -247 305 -283 691 -94 1030 40 70 126 160 1020 1057 1047 1050 1008 1008 996
                                        1098 -6 47 -30 83 -78 115 -29 20 -44 23 -95 20 -50 -3 -68 -9 -100 -35 -78
                                        -63 -1882 -1880 -1928 -1942 -103 -140 -166 -272 -214 -450 -24 -88 -26 -113
                                        -27 -296 0 -223 12 -292 81 -463 258 -644 1006 -945 1646 -663 202 89 156 47
                                        1511 1400 687 685 1268 1273 1292 1306 112 156 165 327 165 530 0 262 -91 479
                                        -276 656 -86 81 -143 120 -248 170 -148 69 -343 99 -506 78z"/>
                                        </g>
                                    </svg>
                                </button>
                                <button class="n8n-mic-button" title="Record voice">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 512.000000 512.000000" fill="#0099ff">
                                        <path d="M0 0 C1.51671886 1.26424817 3.0593383 2.49722026 4.60253906 3.72900391 C19.28864031 15.68237492 33.1902857 29.28168978 44.33349609 44.62451172 C45.62066708 46.38127784 46.9453607 48.10442915 48.27832031 49.82666016 C72.45591287 81.38831197 88.32687017 120.12752123 94.56347656 159.30322266 C94.72428711 160.30675781 94.88509766 161.31029297 95.05078125 162.34423828 C99.15307909 189.19102865 98.85784384 216.50430539 94.56347656 243.30322266 C94.40782227 244.28097656 94.25216797 245.25873047 94.09179688 246.26611328 C83.83070262 307.66882901 48.55341729 366.91574741 -1.70214844 404.01318359 C-3.45613547 405.31781021 -5.18141301 406.65442649 -6.90527344 407.99853516 C-58.49573872 447.71022316 -126.64664264 463.36497081 -190.72607422 455.71557617 C-232.1290536 450.25493496 -271.20213463 435.19680584 -305.43652344 411.30322266 C-306.15565918 410.80177734 -306.87479492 410.30033203 -307.61572266 409.78369141 C-318.02591578 402.43816999 -327.32460976 394.18751632 -336.43652344 385.30322266 C-337.07509277 384.69043457 -337.71366211 384.07764648 -338.37158203 383.44628906 C-346.67181637 375.47831329 -354.27219981 367.3099454 -361.12597656 358.0625 C-362.45449434 356.27909852 -363.81012381 354.5191275 -365.17089844 352.76025391 C-404.6647793 301.10368044 -421.02435224 232.73318877 -412.84033203 168.60058594 C-412.40469949 165.49544331 -411.93264328 162.39924907 -411.43652344 159.30322266 C-411.28086914 158.32546875 -411.12521484 157.34771484 -410.96484375 156.34033203 C-402.66879853 106.69653249 -378.42754956 60.28925426 -343.43652344 24.30322266 C-342.82550781 23.66642578 -342.21449219 23.02962891 -341.58496094 22.37353516 C-333.27930111 13.73697254 -324.82481479 5.71874882 -315.1796875 -1.40234375 C-313.40167473 -2.7226552 -311.64898673 -4.07204745 -309.89746094 -5.42724609 C-231.90738178 -65.10203185 -121.53510399 -69.85830349 0 0 Z " fill="#2F6FDD" transform="translate(414.4365234375,54.69677734375)"/>
                                        <path d="M0 0 C12.42224174 10.39773082 19.76584284 22.52302065 23.8125 38.1875 C23.98958874 38.80172569 24.16667747 39.41595139 24.34913254 40.04878998 C24.87862699 42.49271446 24.94449123 44.71825806 24.95294189 47.21936035 C24.95865204 48.23404388 24.96436218 49.24872742 24.97024536 50.29415894 C24.97192215 51.95549362 24.97192215 51.95549362 24.97363281 53.65039062 C24.97859772 54.82163483 24.98356262 55.99287903 24.98867798 57.19961548 C25.00077656 60.41083164 25.0082431 63.62201141 25.01268864 66.83324623 C25.01562559 68.84415082 25.01973173 70.85504979 25.02419281 72.86595154 C25.03786635 79.17067833 25.04753158 85.47539218 25.0513947 91.78013277 C25.05586392 99.03259997 25.07335924 106.28487762 25.1023953 113.53728724 C25.12410805 119.15789494 25.1341042 124.77844973 25.13543582 130.39909887 C25.13647778 133.74854452 25.1437283 137.09767117 25.16025543 140.44709778 C25.1774211 144.1946929 25.17540931 147.94183402 25.16894531 151.68945312 C25.1781601 152.78081573 25.18737488 153.87217834 25.1968689 154.99661255 C25.14152213 165.30482332 23.00793096 174.98339502 18.3125 184.1875 C17.97210693 184.859021 17.63171387 185.53054199 17.28100586 186.22241211 C8.18571212 203.25357726 -8.13754902 214.27458502 -26.1875 220.1875 C-40.96035048 223.42695866 -57.47272057 222.52258239 -71.1875 216.1875 C-72.15429688 215.7646875 -73.12109375 215.341875 -74.1171875 214.90625 C-89.98826543 207.17303356 -102.02001346 192.36911802 -108.50275135 176.19633675 C-111.19925232 168.28565266 -111.48105258 160.32587591 -111.4621582 152.04345703 C-111.46726913 150.87133667 -111.47238007 149.69921631 -111.47764587 148.49157715 C-111.49146955 144.64276935 -111.49059054 140.79414207 -111.48828125 136.9453125 C-111.49059497 134.9344191 -111.49409906 132.92353004 -111.497688 130.91263855 C-111.50874341 124.59782809 -111.50924309 118.28307714 -111.50317383 111.96826172 C-111.49713751 105.48463012 -111.50944538 99.00121572 -111.5307439 92.51762116 C-111.54843871 86.9223599 -111.55434891 81.32716728 -111.55110615 75.73187912 C-111.54930558 72.40266223 -111.55314744 69.07372314 -111.56582069 65.74451065 C-111.57823904 62.02628374 -111.57136063 58.30855178 -111.55981445 54.59033203 C-111.56745819 53.50839569 -111.57510193 52.42645935 -111.58297729 51.31173706 C-111.45647745 32.76193832 -103.84802264 17.3438609 -91.171875 4.078125 C-65.69586911 -20.26561396 -27.45332059 -20.96435391 0 0 Z " fill="#FEFEFE" transform="translate(299.1875,103.8125)"/>
                                        <path d="M0 0 C2.87029869 1.79393668 4.49131638 2.98263276 6 6 C6.19375772 8.12291066 6.38273173 10.24640357 6.54345703 12.37207031 C8.67955691 39.55053259 18.92903508 63.9102293 40 82 C60.17214379 97.7804004 84.37234267 105.60533967 110 103 C136.11046367 99.09316278 159.09631304 86.76179985 175.1953125 65.5859375 C184.9892939 51.55213731 190.84389608 36.36245029 192.484375 19.2890625 C192.56212158 18.48428467 192.63986816 17.67950684 192.7199707 16.8503418 C192.86174081 15.2778233 192.98614651 13.7036127 193.09057617 12.12817383 C193.50778592 7.22582299 194.4871831 4.47282278 198 1 C201.47263273 -0.73631636 205.21193013 -0.60190402 209 0 C211.75569447 2.18159145 213.43588747 3.87177494 215 7 C217.33691368 35.85816665 204.52083635 63.88912672 186.75390625 85.765625 C167.41565338 108.24074242 140.16137552 121.08386245 111 124 C111 134.23 111 144.46 111 155 C114.26261719 154.96519531 117.52523437 154.93039062 120.88671875 154.89453125 C124.05069097 154.87112719 127.2146535 154.8529154 130.37866211 154.83520508 C132.57564621 154.82012948 134.77260026 154.79966574 136.96948242 154.77368164 C140.12947 154.73724498 143.28905924 154.72026116 146.44921875 154.70703125 C147.91979988 154.68380547 147.91979988 154.68380547 149.42008972 154.66011047 C155.66306293 154.65857381 159.0765136 155.46631179 163.875 159.625 C165.67939414 163.43427651 165.09501562 167.00209061 164 171 C161.75410675 173.99452434 160.55130633 174.81623122 157 176 C155.44024881 176.09947413 153.87665187 176.14350139 152.31376648 176.15390015 C150.86914536 176.16680084 150.86914536 176.16680084 149.39533997 176.17996216 C148.34021713 176.18422211 147.2850943 176.18848206 146.19799805 176.19287109 C145.08553711 176.20104858 143.97307617 176.20922607 142.8269043 176.21765137 C139.13851461 176.2425029 135.45016337 176.2590196 131.76171875 176.2734375 C130.50321421 176.27876118 129.24470966 176.28408485 127.94806862 176.28956985 C122.65940906 176.31079697 117.37075527 176.32992729 112.08206463 176.34119225 C104.5099254 176.35742891 96.93829944 176.3906072 89.36635369 176.44759309 C83.39537731 176.49099426 77.42451524 176.50694035 71.45337868 176.51332474 C68.91562048 176.52004887 66.3778701 176.53530082 63.84021568 176.55921555 C60.28980701 176.59076918 56.74069714 176.59091792 53.19018555 176.58349609 C52.14113541 176.59990143 51.09208527 176.61630676 50.01124573 176.63320923 C45.40157823 176.59374052 42.05074243 176.56127426 38.3618927 173.60391235 C35.37556546 170.31158058 34.91720764 168.52249614 34.6875 164.22265625 C35.23528501 160.32653534 37.16101017 158.64092077 40 156 C42.39582346 154.80208827 43.86777538 154.8793256 46.54150391 154.88647461 C47.48232819 154.88655014 48.42315247 154.88662567 49.39248657 154.88670349 C50.41023163 154.89186478 51.42797668 154.89702606 52.4765625 154.90234375 C54.03713882 154.90446617 54.03713882 154.90446617 55.62924194 154.90663147 C58.96119021 154.91224134 62.29307195 154.92479553 65.625 154.9375 C67.88020736 154.94251373 70.13541578 154.94707686 72.390625 154.95117188 C77.92712975 154.96136426 83.46349017 154.9809378 89 155 C89 144.77 89 134.54 89 124 C83.555 123.505 83.555 123.505 78 123 C50.2450228 118.50606785 24.57550623 101.40169471 8 79 C-6.17032116 59.1639511 -18.46131918 31.97360396 -15 7 C-11.61041298 0.09160417 -7.24944534 -1.06833931 0 0 Z " fill="#FCFDFE" transform="translate(156,247)"/>
                                    </svg>
                                </button>
                                <button class="n8n-send-button" style="display: none;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20.001" height="20" viewBox="0 0 20.001 20">
                                    <g id="Path_127105" data-name="Path 127105" transform="translate(0 20) rotate(-90)" fill="none" fill-rule="evenodd">
                                        <path d="M17.776,13.6,5.752,19.573a4,4,0,0,1-5.3-5.431L2.57,10,.457,5.859A4,4,0,0,1,5.752.428L17.776,6.4A4.021,4.021,0,0,1,17.776,13.6ZM11.592,9.412a.588.588,0,0,1,0,1.176h-8L1.506,14.674A2.819,2.819,0,0,0,5.233,18.52l12.026-5.975a2.849,2.849,0,0,0,0-5.09L5.232,1.481A2.819,2.819,0,0,0,1.5,5.326L3.589,9.412h8Z" stroke="none"/>
                                        <path d="M 3.981279611587524 20.00092697143555 C 1.232009768486023 20.00092697143555 -0.9926430583000183 16.98419761657715 0.4566248953342438 14.14200210571289 L 2.570134878158569 10.00046253204346 L 0.4574649035930634 5.858922481536865 C -1.296665191650391 2.420552492141724 2.327553033828735 -1.273617386817932 5.751864910125732 0.4278825223445892 L 17.77585411071777 6.403352737426758 C 20.74137496948242 7.876242637634277 20.74137496948242 12.12471294403076 17.77585411071777 13.59758281707764 L 5.751864910125732 19.57304191589355 C 5.158058643341064 19.86808395385742 4.558011054992676 20.00092697143555 3.981279611587524 20.00092697143555 Z M 3.589724779129028 10.58847236633301 L 1.505814909934998 14.67401218414307 C 0.2615449130535126 17.10984420776367 2.810936450958252 19.72336006164551 5.232824802398682 18.51955223083496 L 17.25849533081055 12.54408264160156 C 19.34981536865234 11.50459289550781 19.34981536865234 8.493912696838379 17.25849533081055 7.454312324523926 L 5.231985092163086 1.48053252696991 C 2.81089448928833 0.2773919999599457 0.2607449889183044 2.890092849731445 1.504974842071533 5.326072692871094 L 3.588884830474854 9.411612510681152 L 11.59238529205322 9.412452697753906 C 11.91559505462646 9.412452697753906 12.17957496643066 9.675612449645996 12.17957496643066 10.00046253204346 C 12.17957496643066 10.32531261444092 11.91559505462646 10.58847236633301 11.59238529205322 10.58847236633301 L 3.589724779129028 10.58847236633301 Z" stroke="none" fill="#09f"/>
                                    </g>
                                    </svg>
                                </button>
                            </div>
                            <input type="file" class="n8n-file-input" multiple />
                        <div class="n8n-chat-footer">
                    <a href="\${config.branding.poweredBy.link}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px;">
                        \${
                            config.branding.poweredBy.logo
                            ? \`<img src="\${config.branding.poweredBy.logo}" alt="Logo" style="height: 20px; vertical-align: middle;">\`
                            : \`<span style="height: 20px; display: inline-block; vertical-align: middle;">\` +
                            \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" style="height: 18px; vertical-align: middle;"><defs><style>.cls-1{fill:url(#linear-gradient);}.cls-2{opacity:0.2;}.cls-3{opacity:0.7;}.cls-4{fill:url(#linear-gradient-2);}.cls-5{fill:url(#linear-gradient-3);}</style><linearGradient id="linear-gradient" x1="91.03" y1="137.01" x2="147.75" y2="89.42" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ee743b"/><stop offset="1" stop-color="#f7d21e"/></linearGradient><linearGradient id="linear-gradient-2" x1="43.85" y1="104.81" x2="200" y2="104.81" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#007bc1"/><stop offset="1" stop-color="#09f"/></linearGradient><linearGradient id="linear-gradient-3" x1="16.25" y1="166.54" x2="179.81" y2="29.29" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#017cc1"/><stop offset="1" stop-color="#09f"/></linearGradient></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M145.05,154.81c-14.32,7.21-20.35-1.08-20.37-1.1a15.46,15.46,0,0,1-4.25-10.57V56.86a25,25,0,0,0-25,25v58.2C107.46,165.46,133,162.73,145.05,154.81Z"/><g class="cls-2"><path class="cls-3" d="M124.68,153.72a15.24,15.24,0,0,1-2.85-4.25,28.54,28.54,0,0,1-26.4-10.12v.72c12,25.4,37.51,21.91,49.57,14C132,162.46,124.7,153.74,124.68,153.72Z"/></g><path class="cls-4" d="M174.69,36.9c-32.06-23.18-81.57-12-110.6,25C48.28,82,41.84,105.64,44.4,126.73,43.6,104.83,54.45,80.14,75,62.07c31.08-27.33,72.55-29.18,92.62-4.14,14.18,17.7,14,44.25,1.63,67.83a92.26,92.26,0,0,1-19.45,25.12,34.46,34.46,0,0,1-4.77,3h0c-8,4.75-16.81,6.69-25.3,5.07-16.82-3-23.38-17.89-24.32-19.85v7.73h0c0,.09,0,.18,0,.27a40,40,0,0,0,13.45,30c.35.33.72.64,1.08.94l.11.09c.32.27.66.53,1,.78,11,8.26,25.53,7.41,37.94.24,9.05-5.23,16.75-12.42,25.4-23l.85-1C209.9,110.29,206.74,60.08,174.69,36.9Z"/><path class="cls-5" d="M100.44,180.51C89,181.73,64.27,179,47.64,167a70.45,70.45,0,0,1-17.78-19.19c-16.22-25.84-7.69-55.38-4.59-64.3,9-29.17,31-48.28,39.47-54.52,9.6-7.06,29.11-18.5,54.22-20.46C150.16,7,167.39,19.37,175.33,24,154.13,3.49,131.27.36,117.05.07,89-1,68.55,9.93,57.65,16.47,53,19.28,28.84,34.15,13.94,62.52A112.5,112.5,0,0,0,2.57,92.45c-1.84,8.44-7.65,37.11,8.17,65.2a82.49,82.49,0,0,0,22.15,25.63,88.77,88.77,0,0,0,31.76,14.63c30.37,5.78,51.86-1.9,60.26-5.44C120.16,192.35,111,191.83,100.44,180.51Z"/></g></g></svg>\` +
                            \`</span>\`
                        }
                        \${config.branding.poweredBy.text}
                    </a>
                </div>
                        </div>
                \`;

                const chatInterface = document.getElementById('n8n-chat-interface');
                chatInterface.innerHTML = defaultChatInterfaceHTML;
                

                const resizeHandle = document.createElement('div');
                resizeHandle.className = 'n8n-resize-handle top-left';
                chatInterface.appendChild(resizeHandle);


                // // Initialize the page
                // document.addEventListener('DOMContentLoaded', () => {
                //     const toggleInput = document.getElementById('videoToggle');
                    
                //     // Set initial state and add iframe if video is on
                //     updateIframeVisibility();
                    
                //     // Add event listener for toggle changes
                //     toggleInput.addEventListener('change', () => {
                //         video = toggleInput.checked ? 'on' : 'off';
                        
                //         // console.log('Video state:', video);
                //         updateIframeVisibility();
                //     });
                // });





                // const newToggleInput = document.getElementById('videoToggle');
                // if (newToggleInput) {
                //     newToggleInput.addEventListener('change', handleToggleChange);
                // }



                

            
                // Chat widget functionality inside iframe
                let currentSessionId = '';
                let currentFiles = [];
                let isRecording = false;
                let mediaRecorder = null;
                let audioChunks = [];
                let abortController = new AbortController();


                // // Configuration passed from parent
                // const config = ${JSON.stringify(config)};

                // console.log('Chat interface:', chatInterface);



                const messagesContainer = document.querySelector('.n8n-chat-messages');
                const textarea = document.querySelector('textarea');
                const sendButton = document.querySelector('.n8n-send-button');
                const micButton = document.querySelector('.n8n-mic-button');
                const fileInput = document.querySelector('.n8n-file-input');
                const fileUploadButton = document.querySelector('.n8n-file-upload-button');
                const filePreviewContainer = document.querySelector('#n8n-file-preview-container');
                const refreshButton = document.querySelector('.n8n-refresh-button');
                const closeButton = document.querySelector('.n8n-close-button');
                // const draggableToggle = new DraggableN8NChatToggle(toggleButton, chatContainer, config);

                // console.log('Messages container:', messagesContainer);
                // console.log('Textarea:', textarea);
                // console.log('Send button:', sendButton);
                // console.log('Mic button:', micButton);
                // console.log('File input:', fileInput);
                // console.log('File upload button:', fileUploadButton);
                // console.log('File preview container:', filePreviewContainer);
                // console.log('Refresh button:', refreshButton);
                // console.log('Close button:', closeButton);




                // Function to initialize chat (only called once)
                function initializeChat() {
                    if (!window.chatInitialized) {
                        // console.log('Initializing chat for the first time...');
                        // Add your default messages here only once
                        // loadDefaultMessages(); // Your function to load default messages
                        window.chatInitialized = true;
                        chatInitialized = true; // Update local reference
                        window.messagesLoaded = true;
                        messagesLoaded = true; // Update local reference
                    }
                }

                // Function to show/resume chat
                function showChat() {
                    // console.log('Showing chat...');
                    // Don't reload messages, just show the existing chat
                    // The chat content should remain as it was
                }

                // Function to initialize chat (only called once)
                function initializeChat() {
                    if (!chatInitialized) {
                        // console.log('Initializing chat for the first time...');
                        // Add your default messages here only once
                        // loadDefaultMessages(); // Your function to load default messages
                        chatInitialized = true;
                        messagesLoaded = true;
                    }
                }

                // Function to show/resume chat
                function showChat() {
                    // console.log('Showing chat...');
                    // Don't reload messages, just show the existing chat
                    // The chat content should remain as it was
                }

                // Listen for messages from parent
                window.addEventListener('message', (event) => {
                    // console.log('Iframe received message:', event.data);
                    
                    try {
                        if (event.data.type === 'startConversation') {
                            // Always check window.chatInitialized
                            if (!window.chatInitialized) {
                                initializeChat();
                                if (typeof startNewConversation === 'function') {
                                    startNewConversation();
                                }
                            } else {
                                showChat();
                                // Don't call startNewConversation again for existing chat
                            }
                        }
                        
                        if (event.data.type === 'closeChat') {
                            // console.log('Chat closed, but content preserved');
                            // Don't reset anything, just hide
                        }
                    } catch (error) {
                        console.error('Error handling message in iframe:', error);
                    }
                });

                // Initialize
                if (typeof updateButtonVisibility === 'function') {
                    updateButtonVisibility();
                }






                



                function generateUUID() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        const r = Math.random() * 16 | 0;
                        const v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }

                function autoResizeTextarea(textarea) {
                    textarea.style.height = 'auto';
                    if (textarea.value.trim() === '') {
                        textarea.style.height = '40px';
                    } else {
                        textarea.style.height = textarea.scrollHeight + 'px';
                    }
                }

                function updateButtonVisibility() {
                    const hasInput = textarea.value.trim().length > 0 || currentFiles.length > 0;
                    sendButton.style.display = hasInput ? 'flex' : 'none';
                    micButton.style.display = hasInput && !isRecording ? 'none' : 'flex';
                }

                function escapeHtml(text) {
                    return text.replace(/[&<>"']/g, function(m) {
                        return ({
                            '&': '&amp;',
                            '<': '&lt;',
                            '>': '&gt;',
                            '"': '&quot;',
                            "'": '&#39;'
                        })[m];
                    });
                }

                // Lazy-loaded Textarea History - Only initializes when arrow keys are pressed
                let textareaHistory = null;

                function setupLazyTextareaHistory() {
                    let messages = [];
                    let currentIndex = -1;
                    let currentDraft = '';
                    let isInitialized = false;

                    // Global keydown listener that works even before textarea exists
                    document.addEventListener('keydown', function(e) {
                        // Only handle arrow keys when focused on textarea
                        if (e.target.tagName !== 'TEXTAREA') return;
                        
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            
                            // Lazy initialize - find textarea when first arrow key is pressed
                            const textarea = e.target;
                            
                            if (e.key === 'ArrowUp') {
                                navigateUp(textarea);
                            } else if (e.key === 'ArrowDown') {
                                navigateDown(textarea);
                            }
                        }
                    });

                    function navigateUp(textarea) {
                        if (messages.length === 0) return;
                        
                        if (currentIndex === -1) {
                            currentDraft = textarea.value;
                            currentIndex = messages.length - 1;
                        } else if (currentIndex > 0) {
                            currentIndex--;
                        }
                        
                        textarea.value = messages[currentIndex];
                        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                    }

                    function navigateDown(textarea) {
                        if (currentIndex === -1) return;
                        
                        currentIndex++;
                        if (currentIndex >= messages.length) {
                            textarea.value = currentDraft;
                            currentIndex = -1;
                        } else {
                            textarea.value = messages[currentIndex];
                        }
                        
                        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                    }

                    // Function to add message to history (call this from your send button)
                    function addToHistory(message) {
                        if (message && message.trim()) {
                            messages.push(message.trim());
                            currentIndex = -1;
                            currentDraft = '';
                        }
                    }

                    // Return API to interact with history
                    return {
                        addMessage: addToHistory,
                        getMessages: () => [...messages],
                        clearHistory: () => {
                            messages = [];
                            currentIndex = -1;
                            currentDraft = '';
                        }
                    };
                }

                // Initialize the lazy history system
                const historyAPI = setupLazyTextareaHistory();

                // Modified version of your send button handler
                // Replace your existing sendButton.addEventListener with this:

                /*
                sendButton.addEventListener('click', () => {
                    const message = textarea.value.trim();
                    if (message || currentFiles.length > 0) {
                        // Add message to history BEFORE sending
                        historyAPI.addMessage(message);
                        
                        sendMessage(message, currentFiles);
                        textarea.value = '';
                        autoResizeTextarea(textarea);
                        currentFiles = [];
                        updateButtonVisibility();
                    }
                });
                */

                // Alternative: Even more dynamic approach
                function createDynamicTextareaHistory() {
                    let messages = [];
                    let currentIndex = -1;
                    let currentDraft = '';

                    // Listen for keydown on document
                    document.addEventListener('keydown', function(e) {
                        // Only handle if target is a textarea
                        if (e.target.tagName !== 'TEXTAREA') return;
                        
                        const textarea = e.target;
                        
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            if (messages.length === 0) return;
                            
                            if (currentIndex === -1) {
                                currentDraft = textarea.value;
                                currentIndex = messages.length - 1;
                            } else if (currentIndex > 0) {
                                currentIndex--;
                            }
                            
                            textarea.value = messages[currentIndex];
                            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                            
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            if (currentIndex === -1) return;
                            
                            currentIndex++;
                            if (currentIndex >= messages.length) {
                                textarea.value = currentDraft;
                                currentIndex = -1;
                            } else {
                                textarea.value = messages[currentIndex];
                            }
                            
                            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                            
                        } else if (e.key === 'Enter' && !e.shiftKey) {
                            // Optional: Handle Enter key to save message
                            const message = textarea.value.trim();
                            if (message) {
                                messages.push(message);
                                currentIndex = -1;
                                currentDraft = '';
                            }
                        }
                    });

                    // Global function to add messages from your send button
                    window.addToTextareaHistory = function(message) {
                        if (message && message.trim()) {
                            messages.push(message.trim());
                            currentIndex = -1;
                            currentDraft = '';
                        }
                    };

                    return {
                        addMessage: (message) => {
                            if (message && message.trim()) {
                                messages.push(message.trim());
                                currentIndex = -1;
                                currentDraft = '';
                            }
                        },
                        getMessages: () => [...messages],
                        clearHistory: () => {
                            messages = [];
                            currentIndex = -1;
                            currentDraft = '';
                        }
                    };
                }

                // Initialize the dynamic system
                const dynamicHistory = createDynamicTextareaHistory();

                // Now in your send button handler, just add:
                // dynamicHistory.addMessage(message);
                // or
                // window.addToTextareaHistory(message);
                    
            
            





              

                function formatBotMessage(message) {
                    const codeBlockRegex = /\`\`\`(\\w+)?\\n([\\s\\S]*?)\`\`\`/g;
                    let lastIndex = 0;
                    let result = '';
                    let match;
                    let codeBlockId = 0;

                    while ((match = codeBlockRegex.exec(message)) !== null) {
                        const before = message.slice(lastIndex, match.index);
                        result += before
                            .split('\\n')
                            .map(line => line.trim() ? '<div>' + escapeHtml(line) + '</div>' : '')
                            .join('');
                        const lang = match[1] ? match[1] : '';
                        const code = escapeHtml(match[2]);
                        const thisId = 'code-block-' + Date.now() + '-' + (codeBlockId++);
                        result += '<div class="n8n-chat-code-block-wrapper">' +
                            '<button class="n8n-copy-code-btn" data-target="' + thisId + '" title="Copy code">Copy</button>' +
                            '<pre class="n8n-chat-code-block"><code id="' + thisId + '"' + (lang ? ' class="language-' + lang + '"' : '') + '>' + code + '</code></pre>' +
                            '</div>';
                        lastIndex = codeBlockRegex.lastIndex;
                    }
                    const after = message.slice(lastIndex);
                    result += after
                        .split('\\n')
                        .map(line => line.trim() ? '<div>' + escapeHtml(line) + '</div>' : '')
                        .join('');
                    return result;
                }

                
                
                
                async function startNewConversation() {
                    
                    currentSessionId = generateUUID();
                    const brandingMessageDiv = document.createElement('div');
                    // Add the bot's greeting message
                    const timeWithDate = new Date().toLocaleString([], {
                        // year: 'numeric',
                        // month: 'short',
                        // day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });


                    const botMessageDiv1 = document.createElement('div');
                    botMessageDiv1.className = 'n8n-chat-message bot';
                    botMessageDiv1.style.position = 'relative';
                    botMessageDiv1.style.background = '#ffffffff';
                    botMessageDiv1.style.borderRadius = '8px';
                    botMessageDiv1.style.margin = '10px 0';

                    botMessageDiv1.innerHTML = \`
                        <div class="n8n-message-bubble" style="position: relative;">
                            <div class="n8n-avatar n8n-bot-avatar"></div>
                            <div class="n8n-message-content">
                                Hi<br>
                                I am AARYA (Automated AI Responder at Your Assistance).<br>
                                How can I assist you today?
                            </div>
                            <div style="position: absolute; top: -20px; right: 10px; font-size: 10px; color: #666;display: flex; align-items: center;left: 0;">
                            <div class='n8n-message-bot-who'>Aarya</div> \${timeWithDate}
                            </div>
                        </div>
                    \`;
                    
                    
                    // Append to container
                    messagesContainer.appendChild(brandingMessageDiv);
                    
                    messagesContainer.appendChild(botMessageDiv1);
                    
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    
                    // WebSocket setup
                    if (config.wss && config.wss.url) {
                        let wsUrl = config.wss.url;
                        if (config.wss.params && Object.keys(config.wss.params).length > 0) {
                            const urlParams = new URLSearchParams(config.wss.params);
                            const separator = wsUrl.includes('?') ? '&' : '?';
                            wsUrl = \`\${wsUrl}\${separator}\${urlParams.toString()}\`;
                        }

                        socket = new WebSocket(wsUrl);
                        socket.onopen = () => {
                            // console.log('WebSocket connection established');
                        };
                        socket.onerror = (error) => {                   
                            // console.error('WebSocket error:', error);
                        };
                        socket.onclose = () => {
                            // console.log('WebSocket connection closed');
                        };
                    } else {
                        console.error('WebSocket URL not defined in config');
                    }
                }


                function showImagePopup(imageUrl, originalElement = null) {
                    // Determine which window to use (parent if in iframe)
                    const targetWindow = window.top !== window.self ? window.top : window;
                    
                    // Remove existing popup if any
                    const existingBackdrop = targetWindow.document.querySelector('.n8n-dialog-backdrop');
                    if (existingBackdrop) existingBackdrop.remove();

                    // Create backdrop in the target window
                    const backdrop = targetWindow.document.createElement('div');
                    backdrop.className = 'n8n-dialog-backdrop';
                    
                    // Create dialog container
                    const dialog = targetWindow.document.createElement('div');
                    dialog.className = 'n8n-image-dialog';

                    // Create close button
                    const closeButton = targetWindow.document.createElement('button');
                    closeButton.className = 'n8n-dialog-close-button';
                    closeButton.innerHTML = '&times;';
                    closeButton.setAttribute('aria-label', 'Close image popup');

                    // Create image element
                    const img = targetWindow.document.createElement('img');
                    img.className = 'n8n-responsive-popup-image';
                    img.alt = 'Popup image';
                    
                    // Add loading state
                    const loadingDiv = targetWindow.document.createElement('div');
                    loadingDiv.className = 'n8n-popup-loading';
                    dialog.appendChild(loadingDiv);
                    
                    // Error handling for image loading
                    img.onerror = () => {
                        console.error('Failed to load image in popup:', imageUrl);
                        loadingDiv.textContent = 'Failed to load image';
                        
                        if (originalElement && originalElement.complete) {
                            try {
                                const canvas = targetWindow.document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                canvas.width = originalElement.naturalWidth || originalElement.width;
                                canvas.height = originalElement.naturalHeight || originalElement.height;
                                ctx.drawImage(originalElement, 0, 0);
                                img.src = canvas.toDataURL();
                            } catch (e) {
                                console.error('Canvas fallback failed:', e);
                            }
                        }
                    };
        
                    img.onload = () => {
                        if (loadingDiv.parentNode) {
                            loadingDiv.remove();
                        }
                        dialog.appendChild(img);
                    };

                    // Set image source
                    img.src = imageUrl;

                    // Assemble dialog
                    dialog.appendChild(closeButton);
                    backdrop.appendChild(dialog);
                    targetWindow.document.body.appendChild(backdrop);

                    // Add styles to target window
                    addImagePopupStyles(targetWindow);

                    // Close dialog function
                    const closeDialog = () => {
                        backdrop.classList.add('closing');
                        setTimeout(() => {
                            if (backdrop.parentNode) {
                                backdrop.remove();
                            }
                            targetWindow.document.body.style.overflow = '';
                        }, 200);
                    };

                    // Event listeners
                    closeButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        closeDialog();
                    });
                    
                    backdrop.addEventListener('click', (e) => {
                        if (e.target === backdrop) {
                            closeDialog();
                        }
                    });
                    
                    // Close on Escape key
                    const escapeHandler = (e) => {
                        if (e.key === 'Escape') {
                            closeDialog();
                            targetWindow.document.removeEventListener('keydown', escapeHandler);
                        }
                    };
                    targetWindow.document.addEventListener('keydown', escapeHandler);
                    
                    // Prevent body scroll while popup is open
                    targetWindow.document.body.style.overflow = 'hidden';
                }

                function addImagePopupStyles(targetWindow) {
                    const styleId = 'n8n-image-popup-styles';
                    if (targetWindow.document.getElementById(styleId)) return;

                    const style = targetWindow.document.createElement('style');
                    style.id = styleId;
                    style.textContent = \`
                        .n8n-dialog-backdrop {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-color: rgba(0, 0, 0, 0.8);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            z-index: 9999;
                        }
                        .n8n-image-dialog {
                            position: relative;
                            max-width: 90vw;
                            max-height: 90vh;
                        }
                        .n8n-dialog-close-button {
                            position: absolute;
                            top: 15px;
                            right: 15px;
                            background: rgba(0,0,0,0.5);
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            font-size: 24px;
                            cursor: pointer;
                            z-index: 10;
                        }
                        .n8n-responsive-popup-image {
                            max-width: 100%;
                            max-height: 90vh;
                            display: block;
                            margin: 0 auto;
                        }
                        .n8n-popup-loading {
                            color: white;
                            font-size: 18px;
                            padding: 20px;
                        }
                        .closing {
                            animation: fadeOut 0.2s ease-out forwards;
                        }
                        @keyframes fadeOut {
                            to { opacity: 0; }
                        }
                    \`;
                    targetWindow.document.head.appendChild(style);
                }

                function enableImagePreview(imgElement, fileUrl) {
                    imgElement.classList.add('n8n-image-preview');
                    
                    const setupClickHandler = () => {
                        imgElement.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            showImagePopup(fileUrl, imgElement);
                        });
                    };
                    
                    if (imgElement.complete && imgElement.naturalWidth > 0) {
                        setupClickHandler();
                    } else {
                        imgElement.addEventListener('load', setupClickHandler);
                        imgElement.addEventListener('error', () => {
                            console.error('Failed to load preview image:', fileUrl);
                        });
                    }
                }


    

                // Message queue system
                let typingQueue = [];
                let isCurrentlyTyping = false;
                // Track speaking state
                let isSpeaking = false;

                // Speech queue system
                let speechQueue = [];
                let isProcessingQueue = false;

                // Modified speakText function with queue support
                function speakTextWithFallback(text) {
                let trimmedText = text
                        .replace(/[\\n]{2,}/g, ' ')            
                        .replace(/!/g, '')                    
                        .replace(new RegExp('[\\\\p{Emoji_Presentation}\\\\p{Extended_Pictographic}]', 'gu'), '')  
                        .trim();
                    // Add text to queue
                    speechQueue.push(trimmedText);
                    
                    // Start processing queue if not already processing
                    if (!isProcessingQueue) {
                        processNextInQueue();
                    }
                }

                // Process the next item in the speech queue
                function processNextInQueue() {
                    if (speechQueue.length === 0) {
                        isProcessingQueue = false;
                        return;
                    }
                    
                    isProcessingQueue = true;
                    const currentText = speechQueue.shift(); // Remove first item from queue
                    
                    
                    // Hide textarea when starting to speak
                    hideTextarea();
                    isSpeaking = true;
                    
                    const iframe = document.getElementById('trulience-iframe');
                    const iframeWindow = iframe?.contentWindow;
                    if (iframeWindow) {
                        iframeWindow.postMessage(
                            { command: 'trl-chat', message: currentText },
                            'https://trulience.com'
                        );
                    }
                    
                    // Fallback: Show textarea after estimated duration if no completion message received
                    const estimatedDuration = estimateSpeechDuration(currentText);
                    setTimeout(() => {
                        if (isSpeaking) {
                            isSpeaking = false;
                            // Process next item in queue after current one completes
                            processNextInQueue();
                            // Only show textarea if queue is empty
                            if (speechQueue.length === 0) {
                                showTextarea();
                            }
                        }
                    }, estimatedDuration);
                }

                



                // Function to disable textarea and show speaking message
                function hideTextarea() {
                    const textarea = document.querySelector('.n8n-chat-widget .n8n-chat-input textarea');
                    // const fileInput = document.querySelector('.n8n-chat-widget .n8n-file-upload-button');
                    const micButton = document.querySelector('.n8n-chat-widget .n8n-mic-button');
                    const sendButton = document.querySelector('.n8n-chat-widget .n8n-send-button');

                    if (textarea) {

                        // // fileInput.style.display = 'none';
                        // micButton.style.display = 'none';
                        // sendButton.style.display = 'none';
                        micButton.disabled = true;
                        sendButton.disabled = true;
                        micButton.style.cursor = 'not-allowed';
                        sendButton.style.cursor = 'not-allowed';


                        // // Store original values
                        // textarea.dataset.originalValue = textarea.value;
                        // textarea.dataset.originalPlaceholder = textarea.placeholder || '';
                        
                        // // Set speaking message and disable input
                        // textarea.value = 'Speaking... Please wait';
                        // textarea.style.fontWeight = 'bold';
                        // textarea.disabled = true;
                        // textarea.style.cursor = 'not-allowed';
                        
                    }
                }

                // Function to restore textarea
                function showTextarea() {
                    const textarea = document.querySelector('.n8n-chat-widget .n8n-chat-input textarea');
                    // const fileInput = document.querySelector('.n8n-chat-widget .n8n-file-upload-button');
                    const micButton = document.querySelector('.n8n-chat-widget .n8n-mic-button');
                    const sendButton = document.querySelector('.n8n-chat-widget .n8n-send-button');

                    
                    if (textarea) {
                        // // fileInput.style.display = '';
                        // micButton.style.display = '';
                        // sendButton.style.display = '';
                        micButton.disabled = false;
                        sendButton.disabled = false;
                        micButton.style.cursor = '';
                        sendButton.style.cursor = '';

                        // // Restore original values and enable input
                        // textarea.value = textarea.dataset.originalValue || '';
                        // textarea.placeholder = textarea.dataset.originalPlaceholder || '';
                        // textarea.style.fontWeight = '';
                        // textarea.disabled = false;
                        // textarea.style.cursor = '';
                        // textarea.style.backgroundColor = '';
                        
                        // // Clean up stored data
                        // delete textarea.dataset.originalValue;
                        // delete textarea.dataset.originalPlaceholder;
                        
                        // // Focus back to textarea
                        // textarea.focus();
                    }
                }

                function estimateSpeechDuration(text) {
                    // Rough estimate: 150 words per minute average speaking rate
                    const wordsPerMinute = 150;
                    const words = text.split(' ').length;
                    const durationMs = (words / wordsPerMinute) * 60 * 1000;
                    
                    // Add a small buffer
                    return durationMs + 1000;
                }


            // Track messages and their positions
            const messageTracker = new Map(); // Store message elements by msg_id
            const messageSequences = new Map(); // Track sequences of responses for each user message

            let msg_id = 1;

            function extractMsgIdNumber(msgId) {
                // Extract the number from msg_id format like "msg_id-1", "msg_id-2", etc.
                const match = msgId.match(/msg_id-(\\d+)/);
                return match ? parseInt(match[1]) : null;
            }

            function findInsertionPointForUserMessage(msgId) {
                const parsedId = extractMsgIdNumber(msgId);
                if (!parsedId) return messagesContainer.children.length;
                
                // Find the position where this user message should be inserted
                const existingMessages = Array.from(messagesContainer.children);
                
                for (let i = 0; i < existingMessages.length; i++) {
                    const element = existingMessages[i];
                    const elementMsgId = element.getAttribute('data-msg-id');
                    
                    if (elementMsgId) {
                        const elementParsedId = extractMsgIdNumber(elementMsgId);
                        if (elementParsedId && elementParsedId > parsedId) {
                            return i;
                        }
                    }
                }
                
                return existingMessages.length;
            }

            function findInsertionPointForBotResponse(responseMsgId) {
                const sequence = messageSequences.get(responseMsgId);
                if (!sequence) return null;
                
                // Find the last response in this sequence
                const lastResponse = sequence.responses[sequence.responses.length - 1];
                
                if (lastResponse && lastResponse.parentNode === messagesContainer) {
                    // Insert after the last response
                    return lastResponse.nextSibling;
                } else {
                    // Insert right after user message if no responses yet
                    return sequence.userMessage.nextSibling;
                }
            }



                            
                async function sendMessage(message, files = []) {
                    const formData = new FormData();
                    const messageSessionId = currentSessionId;

                    const currentMsgId = \`msg_id-\${msg_id}\`;
                    
                    const messageData = {
                        action: "sendMessage",
                        sessionId: currentSessionId,
                        route: config.webhook.route,
                        chatInput: message,
                        message: {
                            payload: message,
                        },
                        msg_id: currentMsgId,
                    };
                    
                    // Store the current msg_id before incrementing
                    const currentSequenceKey = currentMsgId;
                    msg_id += 1;


                    // Add headers if present
                    if (config.wss.header) {
                        messageData.headers = config.wss.header;
                    } 



                    formData.append('json', new Blob([JSON.stringify(messageData)], { type: 'application/json' }));
                    formData.append('sessionId', currentSessionId);

                    if (files.length > 0) {
                        files.forEach(file => {
                            formData.append('files', file);
                        });
                    }

                    const userMessageDiv = document.createElement('div');
                    userMessageDiv.className = 'n8n-chat-message user';
                    userMessageDiv.setAttribute('data-msg-id', currentMsgId);

                    // Create the message bubble container
                    const messageBubble = document.createElement('div');
                    messageBubble.className = 'n8n-message-bubble-user';

                    // Handle files (audio, images, etc.)
                    if (files.length > 0) {
                        files.forEach(file => {
                            const isImage = file.type.startsWith('image/');
                            const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.mp3');

                            let fileUrl;
                            try {
                                fileUrl = URL.createObjectURL(file);

                                if (isAudio) {
                                    // Create container div for audio
                                    const audioContainer = document.createElement('div');
                                    audioContainer.style.width = '100%';

                                    // Create audio element
                                    const audioElement = document.createElement('audio');
                                    audioElement.controls = true;
                                    audioElement.style.width = '100%';
                                    audioElement.style.background = 'transparent linear-gradient(153deg, #DDF1FF 0%, #FFD8A3 100%) 0% 0% no-repeat padding-box';
                                    audioElement.style.borderRadius = '8px';

                                    // Create source element for audio
                                    const sourceElement = document.createElement('source');
                                    sourceElement.src = fileUrl;
                                    sourceElement.type = file.type || 'audio/mp3';
                                    audioElement.appendChild(sourceElement);

                                    // Fallback text for unsupported browsers
                                    audioElement.appendChild(document.createTextNode('Your browser does not support audio playback'));

                                    // Create file name div
                                    const fileNameDiv = document.createElement('div');
                                    fileNameDiv.style.fontSize = '12px';
                                    fileNameDiv.style.marginTop = '8px';
                                    fileNameDiv.textContent = file.name;

                                    // Append audio and file name to container
                                    audioContainer.appendChild(audioElement);
                                    audioContainer.appendChild(fileNameDiv);

                                    // Append container to message bubble
                                    messageBubble.appendChild(audioContainer);
                                }else if (isImage) {
                                        // Create image element
                                        const imgElement = document.createElement('img');
                                        imgElement.src = fileUrl;
                                        imgElement.alt = file.name;
                                        imgElement.style.maxWidth = '100%';
                                        imgElement.style.borderRadius = '10px';

                                        // Append image to message bubble
                                        messageBubble.appendChild(imgElement);

                                        // Enable preview on click
                                        enableImagePreview(imgElement, fileUrl);


                                } else {
                                    // Create file message container
                                    const fileMessageDiv = document.createElement('div');
                                    fileMessageDiv.className = 'n8n-file-message';

                                    // Create SVG icon
                                    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                    svgElement.classList.add('n8n-file-icon');
                                    svgElement.setAttribute('viewBox', '0 0 24 24');
                                    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                                    pathElement.setAttribute('d', 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z');
                                    svgElement.appendChild(pathElement);

                                    // Create file name span
                                    const fileNameSpan = document.createElement('span');
                                    fileNameSpan.textContent = file.name;

                                    // Append SVG and file name to file message container
                                    fileMessageDiv.appendChild(svgElement);
                                    fileMessageDiv.appendChild(fileNameSpan);

                                    // Append file message to message bubble
                                    messageBubble.appendChild(fileMessageDiv);
                                }
                            } catch (error) {
                                console.error('Error generating file URL:', error);
                                const errorDiv = document.createElement('div');
                                // errorDiv.textContent = 'Error: Unable to display file {file.name}';
                                messageBubble.appendChild(errorDiv);
                            }
                        });
                    } else {
                        // console.log('No files to process');
                    }

                    // Handle plain text message
                    if (message) {
                        const messageTextDiv = document.createElement('div');
                        messageTextDiv.textContent = message; // Use textContent to preserve whitespace
                        messageBubble.appendChild(messageTextDiv);
                    }

                    // If there's no content (no files and no message), return early
                    if (!messageBubble.hasChildNodes()) {
                        // console.log('No message content to display');
                        return;
                    }

                    // Append the message bubble to the user message div
                    userMessageDiv.appendChild(messageBubble);
                    // Format the timestamp
                    const timeWithDate = new Date().toLocaleString([], {
                        // day: 'numeric',      // e.g., "5"
                        // month: 'short',      // e.g., "Jun"
                        // year: 'numeric',     // e.g., "2025"
                        hour: '2-digit',     // e.g., "04"
                        minute: '2-digit',   // e.g., "17"
                        hour12: true         // e.g., "pm"
                    });



                    // Create a wrapper div for aligning the timestamp
                    const timestampWrapper = document.createElement('div');
                    // timestampWrapper.style.position='absolute';
                    timestampWrapper.style.textAlign = 'right';
                    timestampWrapper.style.marginTop = '-30px'; // Slight spacing below the bubble

                    // Create the timestamp div itself
                    const timestampDiv = document.createElement('div');
                    timestampDiv.style.marginBottom = '-35px';
                    timestampDiv.style.marginTop = '30px';
                    timestampDiv.style.fontSize = '10px';
                    timestampDiv.style.color = '#666';
                    timestampDiv.style.display = 'flex';
                    timestampDiv.style.justifyContent = 'flex-end';
                    timestampDiv.textContent = timeWithDate;

                    const messageWhoDiv = document.createElement('div');
                    messageWhoDiv.className = 'n8n-message-bot-who';
                    messageWhoDiv.textContent = ' You';

                    // Append branding message to the timestamp div
                    timestampDiv.appendChild(messageWhoDiv);

                    // Append timestamp to wrapper
                    timestampWrapper.appendChild(timestampDiv);




                    // Find correct insertion point for user message
    const insertionPoint = findInsertionPointForUserMessage(currentMsgId);
    
    if (insertionPoint >= messagesContainer.children.length) {
        messagesContainer.appendChild(timestampWrapper);
        messagesContainer.appendChild(userMessageDiv);
    } else {
        messagesContainer.insertBefore(timestampWrapper, messagesContainer.children[insertionPoint]);
        messagesContainer.insertBefore(userMessageDiv, messagesContainer.children[insertionPoint + 1]);
    }

    // Initialize sequence tracking for this message
    messageSequences.set(currentSequenceKey, {
        userMessage: userMessageDiv,
        timestamp: timestampWrapper,
        responses: [],
        responseCount: 0 // Track number of responses received
    });

    // Store the user message element
    messageTracker.set(currentMsgId, {
        userMessage: userMessageDiv,
        timestamp: timestampWrapper,
        sequenceKey: currentSequenceKey
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    updateButtonVisibility();

    // Create initial loading indicator
    const loadingDiv = createLoadingIndicator(currentSequenceKey);
    
    // Insert loading indicator right after the user message
    userMessageDiv.parentNode.insertBefore(loadingDiv, userMessageDiv.nextSibling);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store loading element in sequence
    const sequence = messageSequences.get(currentSequenceKey);
    sequence.loadingDiv = loadingDiv;

    // Set timestamps on loading indicators for the auto-remove feature
    function createLoadingIndicator(sequenceKey) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'n8n-loading-indicator';
        loadingDiv.setAttribute('data-loading-for', sequenceKey);
        loadingDiv.dataset.created = Date.now().toString();
        loadingDiv.innerHTML = \`
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        \`;
        return loadingDiv;
    }




                    // // Append message bubble and timestamp to the message container
                    // userMessageDiv.appendChild(messageBubble);
                    // // Now timestamp is under the bubble, right aligned

                    // // Append the user message div to the main messages container
                    // messagesContainer.appendChild(timestampWrapper);
                    // messagesContainer.appendChild(userMessageDiv);
                    // messagesContainer.scrollTop = messagesContainer.scrollHeight;

                    // // Clear input + preview
                    // filePreviewContainer.innerHTML = '';
                    // fileInput.value = '';
                    // currentFiles = [];
                    // updateButtonVisibility();

                    // const loadingDiv = document.createElement('div');
                    // loadingDiv.className = 'n8n-loading-indicator';
                    // loadingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

                    // messagesContainer.appendChild(loadingDiv);
                    // messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    // // console.log('Sending message data:', JSON.stringify(messageData));

                    
                    try {

                        // ✅ Connect WebSocket and send messageData + optional files

                        // Global variable to track last activity
                        let lastActivityTime = Date.now();
                        let smartPingInterval = null;

                        // Function to update last activity time
                        function updateLastActivity() {
                            lastActivityTime = Date.now();
                        }

                        // Function to send smart ping (only if no activity for 1 minute)
                        function sendSmartPing() {
                            const now = Date.now();
                            const timeSinceLastActivity = now - lastActivityTime;
                            const oneMinute = 60 * 1000; // 1 minute in milliseconds
                    
                            if (timeSinceLastActivity >= oneMinute && socket.readyState === WebSocket.OPEN) {
                                const pingMessage = { type: "ping" };
                                // console.log("📤 Sending smart ping after", Math.round(timeSinceLastActivity / 1000), "seconds of inactivity");
                                socket.send(JSON.stringify(pingMessage));
                                updateLastActivity(); // Update activity time after sending ping
                            }
                        }

                        // Check if WebSocket URL is present
                        async function connectWebSocket(messageData, retries = Infinity, delay = 5000) {
                            // console.log("message ", messageData);

                            if (config.wss && config.wss.url) {
                                // console.log('WebSocket inside URL:', socket);

                                // Create socket if not defined or closed
                                if (!socket || socket.readyState > 1) {
                                    socket = new WebSocket(config.wss.url);
                                    socket.binaryType = "arraybuffer"; // Support binary messages
                                    // console.log('New WebSocket created. State:', socket.readyState);
                                }

                                socket.onerror = (err) => {
                                    console.error('WebSocket error:', err);
                                };

                                socket.onclose = (event) => {
                                    console.warn('WebSocket closed:', event.code, event.reason);
                                    
                                    // Clear the smart ping interval when socket closes
                                    if (smartPingInterval) {
                                        clearInterval(smartPingInterval);
                                        smartPingInterval = null;
                                    }
                                    
                                    if (retries > 0) {
                                        console.warn('Retrying in {delay / 1000}s...');
                                        setTimeout(() => connectWebSocket(messageData, retries - 1, delay), delay);
                                    }
                                };

                                const sendFilesOverWebSocket = async () => {
                                    if (files.length === 0) {
                                        const serialized = JSON.stringify(messageData);
                                        socket.send(serialized);
                                        updateLastActivity(); // Update activity after sending
                                        return;
                                    }

                                    for (const file of files) {
                                        try {
                                            // Read the file data first
                                            const arrayBuffer = await file.arrayBuffer();
                                            
                                            // Create a combined message object
                                            const combinedMessage = {
                                                metadata: {
                                                    ...messageData,
                                                    files: [{
                                                        name: file.name,
                                                        type: file.type,
                                                        size: file.size,
                                                        binarySize: arrayBuffer.byteLength
                                                    }]
                                                },
                                            
                                                binaryData: Array.from(new Uint8Array(arrayBuffer)) // Convert to plain array
                                            };

                                            if (socket.readyState === WebSocket.OPEN) {
                                                // console.log("JSON.stringify(combinedMessage)",JSON.stringify(combinedMessage));
                                                // Send as a single JSON message that includes both metadata and binary data
                                                socket.send(JSON.stringify(combinedMessage));
                                                updateLastActivity(); // Update activity after sending
                                                // console.log('Sent combined message for file: {file.name}');
                                            }

                                        } catch (error) {
                                            // console.error('Error sending file:', file.name, error);
                                        }
                                    }
                                };

                                if (socket.readyState === WebSocket.OPEN) {
                                    // console.log('WebSocket already open, sending message');
                                    await sendFilesOverWebSocket();

                                    messageData = {}; // Reset after sending

                                    // Start smart ping interval if not already running
                                    if (!smartPingInterval) {
                                        smartPingInterval = setInterval(sendSmartPing, 30000); // Check every 30 seconds
                                    }           
                                } else {        
                                    socket.onopen = async () => {
                                        // console.log('✅ WebSocket connection established');
                                        updateLastActivity(); // Update activity when connection opens

                                        if (messageData && Object.keys(messageData).length > 0 && messageData.chatInput) {
                                            await sendFilesOverWebSocket();
                                            // console.log("📤 Sent messageData:", serialized);
                                        }

                                        messageData = {}; // Reset after sending

                                        // Start smart ping interval
                                        if (!smartPingInterval) {
                                            smartPingInterval = setInterval(sendSmartPing, 30000); // Check every 30 seconds
                                        }
                                };
                            }

                            socket.onmessage = (event) => {
                                try {
                                    updateLastActivity(); // Update activity when receiving any message
                                    
                                    const receivedData = JSON.parse(event.data);
                                    // console.log("recvied------",receivedData);
                                    if (receivedData.error) {
                                        console.error('Server error:', receivedData.error);
                                        if (receivedData.receivedMessage) {
                                            try {
                                                const innerMessage = JSON.parse(receivedData.receivedMessage);
                                                // console.log('Parsed inner message:', innerMessage);
                                                if (innerMessage.type === 'pong') {
                                                    // console.log('📥 Pong received 1:', innerMessage);
                                                } else if (innerMessage.type === 'ping') {
                                                    const pongMessage = { type: 'pong' };
                                                    // console.log('📤 got ping so Sending pong:', pongMessage);
                                                    socket.send(JSON.stringify(pongMessage));
                                                    updateLastActivity(); // Update activity after sending pong
                                                }
                                            } catch (e) {
                                                // console.warn('⚠️ Failed to parse inner message:', receivedData.receivedMessage);
                                            }
                                        }
                                    } else if (receivedData.type && receivedData.type.includes('Send "PING"')) {
                                        const pongMessage = { type: 'ping' };
                                        // console.log('📤 got connection so Sending ping:', pongMessage);
                                        socket.send(JSON.stringify(pongMessage));
                                        updateLastActivity(); // Update activity after sending ping
                                    } else if (receivedData.type && receivedData.type.includes('pong')) {
                                        // console.log('📥 Pong received:', receivedData);
                                    } else {
                                        // console.log('📥 Received message:', receivedData);
                                        updateLastActivity();
                                        handleResponse(receivedData);
                                    }
                                } catch (e) {
                                    // console.warn('⚠️ Failed to parse JSON, raw message:', event.data);
                                }
                            }; 
                        }else {
                            // Fallback to HTTP if WebSocket URL is not present
                            const response = await fetch(config.webhook.url, {
                                method: 'POST',
                                body: files.length > 0 ? formData : JSON.stringify(messageData),
                                headers: files.length === 0 ? {
                                    'Content-Type': 'application/json'
                                } : undefined,
                                signal: abortController.signal
                            });

                            // console.log('WebSocket URL not present, using HTTP fallback');
                            const data = await response.json();
                            // console.log("response data:", data);
                            
                            loadingDiv.remove();
                            handleResponse(data);
                            }
                        }

                        

                        // ✅ Call the function
                        connectWebSocket(messageData);
                        
                        
function handleOrderedResponse(responseMsgId, rawMessage, table_content, dropdown_content, isLastResponse = false) {
    const sequence = messageSequences.get(responseMsgId);
    
    if (!sequence) {
        console.warn('No sequence found for:', responseMsgId);
        return handleUnorderedResponse(rawMessage, table_content, dropdown_content);
    }

    // Remove loading indicator for the first response or if this is the final response
    if (sequence.responseCount === 0 || isLastResponse) {
        if (sequence.loadingDiv) {
            sequence.loadingDiv.remove();
            sequence.loadingDiv = null;
        }
    }

    // Create bot response message
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'n8n-chat-message bot';
    botMessageDiv.setAttribute('data-msg-id', responseMsgId);
    botMessageDiv.setAttribute('data-response-index', sequence.responseCount);

    // Apply your existing message formatting
    if_video_is_off(botMessageDiv, rawMessage, table_content, dropdown_content);

    // Find insertion point for this response
    const insertionPoint = findInsertionPointForBotResponse(responseMsgId);
    
    if (insertionPoint && insertionPoint.parentNode === messagesContainer) {
        // Insert at the correct position
        messagesContainer.insertBefore(botMessageDiv, insertionPoint);
    } else {
        // Find the last response in this sequence and insert after it
        const lastResponse = sequence.responses[sequence.responses.length - 1];
        if (lastResponse && lastResponse.parentNode === messagesContainer) {
            if (lastResponse.nextSibling) {
                messagesContainer.insertBefore(botMessageDiv, lastResponse.nextSibling);
            } else {
                messagesContainer.appendChild(botMessageDiv);
            }
        } else {
            // Insert right after user message
            if (sequence.userMessage.nextSibling) {
                messagesContainer.insertBefore(botMessageDiv, sequence.userMessage.nextSibling);
            } else {
                messagesContainer.appendChild(botMessageDiv);
            }
        }
    }

    // Update tracking
    const responseKey = \`\${responseMsgId}-response-\${sequence.responseCount}\`;
    messageTracker.set(responseKey, {
        botMessage: botMessageDiv,
        sequenceKey: responseMsgId,
        responseIndex: sequence.responseCount
    });

    // Add to sequence responses
    sequence.responses.push(botMessageDiv);
    sequence.responseCount++;

    // Show new loading indicator if more responses are expected and this isn't marked as final
    const expectMoreResponses = data.has_more || data.streaming || false; // Adjust based on your server response
    
    if (expectMoreResponses && !isLastResponse && !sequence.loadingDiv) {
        const newLoadingDiv = createLoadingIndicator(responseMsgId);
        
        // Insert loading after the current response
        if (botMessageDiv.nextSibling) {
            messagesContainer.insertBefore(newLoadingDiv, botMessageDiv.nextSibling);
        } else {
            messagesContainer.appendChild(newLoadingDiv);
        }
        
        sequence.loadingDiv = newLoadingDiv;
    }

    // Scroll to bottom for latest messages
    const shouldScrollToBottom = checkIfShouldScroll(responseMsgId);
    if (shouldScrollToBottom) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function checkIfShouldScroll(msgId) {
    // Only scroll to bottom if this is one of the latest message conversations
    const allMsgIds = Array.from(messageSequences.keys())
        .map(key => extractMsgIdNumber(key))
        .filter(id => id !== null)
        .sort((a, b) => b - a); // Sort descending
    
    const currentMsgIdNumber = extractMsgIdNumber(msgId);
    
    // Scroll if this is one of the 3 most recent conversations
    const recentMessageIds = allMsgIds.slice(0, 3);
    return recentMessageIds.includes(currentMsgIdNumber);
}

// Utility function to clean up old message tracking data
function cleanupMessageTracker() {
    // Keep only the last 20 message sequences to prevent memory leaks
    const maxSequences = 20;
    const allSequenceKeys = Array.from(messageSequences.keys())
        .map(key => extractMsgIdNumber(key))
        .filter(id => id !== null)
        .sort((a, b) => b - a); // Sort descending (newest first)
    
    if (allSequenceKeys.length > maxSequences) {
        const idsToRemove = allSequenceKeys.slice(maxSequences);
        
        idsToRemove.forEach(id => {
            const msgIdKey = \`msg_id-\${id}\`;
            const sequence = messageSequences.get(msgIdKey);
            
            if (sequence) {
                // Clean up all related message tracker entries
                messageTracker.delete(msgIdKey);
                
                // Clean up response entries
                for (let i = 0; i < sequence.responseCount; i++) {
                    const responseKey = \`\${msgIdKey}-response-\${i}\`;
                    messageTracker.delete(responseKey);
                }
            }
            
            messageSequences.delete(msgIdKey);
        });
    }
}

// Optional: Function to manually mark a sequence as complete
function markSequenceComplete(msgId) {
    const sequence = messageSequences.get(msgId);
    if (sequence && sequence.loadingDiv) {
        sequence.loadingDiv.remove();
        sequence.loadingDiv = null;
    }
}




// Optional: Add a timeout to auto-remove loading indicators
function autoRemoveLoadingIndicators() {
    const loadingIndicators = messagesContainer.querySelectorAll('.n8n-loading-indicator[data-loading-for]');
    loadingIndicators.forEach(indicator => {
        const msgId = indicator.getAttribute('data-loading-for');
        const sequence = messageSequences.get(msgId);
        
        // Remove loading indicators that have been showing for more than 10 seconds
        const createdTime = indicator.dataset.created || Date.now();
        if (Date.now() - parseInt(createdTime) > 10000) {
            indicator.remove();
            if (sequence) {
                sequence.loadingDiv = null;
            }
        }
    });
}

// Set timestamps on loading indicators for the auto-remove feature
function createLoadingIndicator(msgId) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'n8n-loading-indicator';
    loadingDiv.setAttribute('data-loading-for', msgId);
    loadingDiv.dataset.created = Date.now().toString();
    loadingDiv.innerHTML =\`
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    \`;
    return loadingDiv;
}

// Call cleanup periodically
setInterval(cleanupMessageTracker, 60000); // Every minute
setInterval(autoRemoveLoadingIndicators, 5000); // Every 5 seconds

// Utility functions for external use
window.chatMessageUtils = {
    markSequenceComplete,
    cleanupMessageTracker,
    getSequenceInfo: (msgId) => messageSequences.get(msgId),
    getAllSequences: () => Array.from(messageSequences.entries())
};




function handleUnorderedResponse(rawMessage, table_content, dropdown_content) {
    // Remove any loading indicators without sequence keys
    const loadingIndicators = messagesContainer.querySelectorAll('.n8n-loading-indicator:not([data-loading-for])');
    loadingIndicators.forEach(indicator => indicator.remove());

    // Create bot message div
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'n8n-chat-message bot';
    
    if_video_is_off(botMessageDiv, rawMessage, table_content, dropdown_content);
    messagesContainer.appendChild(botMessageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}



                    
                        // Function to simulate typing effect with proper queue support
                        function typeWriter(messageData, text, speed, rawMessage) {
                            return new Promise(resolve => {
                                // Add typing request to queue
                                const typingRequest = {
                                    messageData: messageData,  // Store all message data instead of pre-built div
                                    text: text,
                                    speed: speed,
                                    rawMessage:rawMessage,
                                    resolve: resolve
                                };
                                
                                typingQueue.push(typingRequest);
                                // console.log('Added to typing queue. Queue length:', typingQueue.length);
                                
                                // Process queue if not currently typing
                                if (!isCurrentlyTyping) {
                                    processTypingQueue();
                                }
                            });
                        }

                        // Process the typing queue one by one
                        function processTypingQueue() {
                            // If queue is empty or already typing, return
                            if (typingQueue.length === 0 || isCurrentlyTyping) {
                                return;
                            }
                            
                            // Mark as currently typing
                            isCurrentlyTyping = true;
                            
                            // Get the next typing request
                            const currentRequest = typingQueue.shift();
                            // console.log('Processing typing request. Remaining in queue:', typingQueue.length);
                            
                            // CREATE THE MESSAGE DIV HERE - ONLY WHEN ACTUALLY TYPING
                            const { messageData, text,rawMessage } = currentRequest;
                            const botMessageDiv = document.createElement('div');
                            botMessageDiv.className = 'n8n-chat-message bot';
                            // console.log('rawMessage==================================:', rawMessage);


                            // Prepare HTML content based on actual data
                            let messageBodyHTML = '';
                            let fulltableHTML = '';
                            
                            if (messageData.table_content && Array.isArray(messageData.table_content.columns) && Array.isArray(messageData.table_content.rows)) {
                                messageBodyHTML = \`
                                    <div class="n8n-message-bubble-table" id="n8n-message-body">
                                        <!-- Table will be appended here -->
                                    </div>
                                    <div id="n8n-employee-table"></div>
                                \`;
                                fulltableHTML = \`
                                            <button id="n8n-view-table-btn" title="View Full Table">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                    <path d="M3 3h6v2H5v4H3V3zm18 0v6h-2V5h-4V3h6zM3 21v-6h2v4h4v2H3zm18-6v6h-6v-2h4v-4h2z"/>
                                                </svg>
                                            </button>
                                            <button id="n8n-download-csv-btn" title="Download as CSV">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                                </svg>
                                            </button>
                                \`;
                            }

                            if (messageData.dropdown_content && Array.isArray(messageData.dropdown_content.options) && messageData.dropdown_content.options.length > 0) {
                                messageBodyHTML += \`
                                    <div class="n8n-message-bubble-dropdown" id="n8n-dropdown-body">
                                        <!-- Dropdown will be appended here -->
                                    </div>
                                    <div id="n8n-dropdown-container"></div>
                                    \`;
                            }

                            // Create the message HTML structure
                            botMessageDiv.innerHTML = createMessageHTML(messageData.timeWithDate, messageBodyHTML, fulltableHTML);
                            
                            // Get the message content element for typing
                            const messageContent = botMessageDiv.querySelector('.n8n-message-content');
                            botMessageDiv.scrollTop = botMessageDiv.scrollHeight;


                            // ADD THE MESSAGE DIV TO DOM RIGHT BEFORE TYPING STARTS
                            const chatContainer = document.querySelector('.n8n-chat-messages') || document.querySelector('#n8n-chat-container'); // Adjust selector as needed
                            if (chatContainer) {

                            chatContainer.appendChild(botMessageDiv);
                            // Scroll to bottom after adding message
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                        
                        // Start typing animation
                        startSingleTypingAnimation(messageContent, text, currentRequest.speed, rawMessage).then(() => {

                            // console.log('rawMessage animation completed for message:', rawMessage);

                            // Setup interactions after typing is complete
                            setupMessageInteractions(botMessageDiv, messageData.table_content, messageData.dropdown_content, rawMessage, messageData.rawMessage);
                            
                            
                            // Resolve the promise for this typing request
                            currentRequest.resolve();
                            
                            // Mark typing as complete
                            isCurrentlyTyping = false;
                            
                            // Process next item in queue
                            setTimeout(() => {
                                processTypingQueue();
                            }, 100); // Small delay between messages
                            });
                        }

                        const chatContainer = document.querySelector('.n8n-chat-messages') || document.querySelector('#n8n-chat-container'); // Adjust selector as needed
                        chatContainer.scrollTop = chatContainer.scrollHeight;

                        // The actual typing animation function
                        function startSingleTypingAnimation(element, text, speed) {
                            return new Promise(resolve => {
                                let i = 0;
                                let html = '';

                                // Add cursor styles if not already present
                                if (!document.querySelector('style[data-typing-cursor]')) {
                                    const style = document.createElement('style');
                                    style.setAttribute('data-typing-cursor', 'true');
                                    style.innerHTML = \`
                                        .typing-cursor {
                                            animation: blink 1s infinite;
                                            color: #666;
                                        }
                                        @keyframes blink {
                                            0% { opacity: 1; }
                                            50% { opacity: 0; }
                                            100% { opacity: 1; }
                                        }
                                    \`;
                                    document.head.appendChild(style);
                        }

                        function typing() {
                            if (i < text.length) {
                                html += text.charAt(i);
                                element.innerHTML = html + '<span class="typing-cursor">|</span>';
                                i++;
                                setTimeout(typing, speed);
                                
                                const chatContainer = document.querySelector('.n8n-chat-messages') || document.querySelector('#n8n-chat-container'); // Adjust selector as needed
                                chatContainer.scrollTop = chatContainer.scrollHeight;

                            } else {
                                // Remove cursor when typing is complete
                                element.innerHTML = html;
                                resolve();
                            }
                        }

                            typing();
                            });
                        }



                        // Function to create message HTML structure
                        function createMessageHTML(timeWithDate, messageBodyHTML, fulltableHTML) {
                            const footerHTML = \`
                                <div class="n8n-message-footer" style="position: absolute; order: 2;top: -25px;right:40px;">
                                    <button class="n8n-action-btn n8n-copy-btn" title="Copy">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                        <button class="n8n-action-btn n8n-like-btn" title="Like">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1318 2.50389C12.3321 2.15338 12.7235 1.95768 13.124 2.00775L13.5778 2.06447C16.0449 2.37286 17.636 4.83353 16.9048 7.20993L16.354 8.99999H17.0722C19.7097 8.99999 21.6253 11.5079 20.9313 14.0525L19.5677 19.0525C19.0931 20.7927 17.5124 22 15.7086 22H6C4.34315 22 3 20.6568 3 19V12C3 10.3431 4.34315 8.99999 6 8.99999H8C8.25952 8.99999 8.49914 8.86094 8.6279 8.63561L12.1318 2.50389ZM10 20H15.7086C16.6105 20 17.4008 19.3964 17.6381 18.5262L19.0018 13.5262C19.3488 12.2539 18.391 11 17.0722 11H15C14.6827 11 14.3841 10.8494 14.1956 10.5941C14.0071 10.3388 13.9509 10.0092 14.0442 9.70591L14.9932 6.62175C15.3384 5.49984 14.6484 4.34036 13.5319 4.08468L10.3644 9.62789C10.0522 10.1742 9.56691 10.5859 9 10.8098V19C9 19.5523 9.44772 20 10 20ZM7 11V19C7 19.3506 7.06015 19.6872 7.17071 20H6C5.44772 20 5 19.5523 5 19V12C5 11.4477 5.44772 11 6 11H7Z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                        <button class="n8n-action-btn n8n-dislike-btn" title="Dislike">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.8727 21.4961C11.6725 21.8466 11.2811 22.0423 10.8805 21.9922L10.4267 21.9355C7.95958 21.6271 6.36855 19.1665 7.09975 16.7901L7.65054 15H6.93226C4.29476 15 2.37923 12.4921 3.0732 9.94753L4.43684 4.94753C4.91145 3.20728 6.49209 2 8.29589 2H18.0045C19.6614 2 21.0045 3.34315 21.0045 5V12C21.0045 13.6569 19.6614 15 18.0045 15H16.0045C15.745 15 15.5054 15.1391 15.3766 15.3644L11.8727 21.4961ZM14.0045 4H8.29589C7.39399 4 6.60367 4.60364 6.36637 5.47376L5.00273 10.4738C4.65574 11.746 5.61351 13 6.93226 13H9.00451C9.32185 13 9.62036 13.1506 9.8089 13.4059C9.99743 13.6612 10.0536 13.9908 9.96028 14.2941L9.01131 17.3782C8.6661 18.5002 9.35608 19.6596 10.4726 19.9153L13.6401 14.3721C13.9523 13.8258 14.4376 13.4141 15.0045 13.1902V5C15.0045 4.44772 14.5568 4 14.0045 4ZM17.0045 13V5C17.0045 4.64937 16.9444 4.31278 16.8338 4H18.0045C18.5568 4 19.0045 4.44772 19.0045 5V12C19.0045 12.5523 18.5568 13 18.0045 13H17.0045Z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                        <button class="n8n-action-btn n8n-speak-btn" title="Read aloud">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                        \${fulltableHTML}
                                    </div>\`;

                            return \`
                                <div class="n8n-bot-message-container">
                                    <div class="n8n-message-bubble">
                                        <div class="n8n-avatar n8n-bot-avatar"></div>                     
                                        <div class="n8n-message-content"></div>
                                        <div class="n8n-message-content1" style="position: absolute; margin-left:10px; top: -20px; right: 10px; font-size: 10px; color: #666; order: 1;display: flex;align-items: center;left: 0;">
                                            <div class='n8n-message-bot-who'>Aarya</div> \${timeWithDate}
                                        </div>
                                    </div>
                                    \${messageBodyHTML}
                                    \${footerHTML}
                                </div>\`;
                            }

                        // Function to handle post-typing actions (table, dropdown, and button setup)
                        function setupMessageInteractions(botMessageDiv, table_content, dropdown_content, text, rawMessage) {
                            // Handle table content
                            if (table_content && Array.isArray(table_content.columns) && Array.isArray(table_content.rows)) {
                                const messageBody = botMessageDiv.querySelector("#n8n-message-body");
                                if (messageBody) {
                                    const table = createTableFromJSON(table_content);
                                    messageBody.appendChild(table);

                                    const viewTableBtn = botMessageDiv.querySelector('#n8n-view-table-btn');
                                    if (viewTableBtn) {
                                        viewTableBtn.addEventListener('click', () => {
                                            showTablePopup(table_content);
                                        });
                                    }

                                    messageBody.addEventListener('click', () => {
                                        showTablePopup(table_content);
                                    });

                                    const downloadCsvBtn = botMessageDiv.querySelector('#n8n-download-csv-btn');
                                    if (downloadCsvBtn) {
                                        downloadCsvBtn.addEventListener('click', () => {
                                            downloadTableAsCSV(table_content);
                                        });
                                    }
                                }
                            }

                            // Handle dropdown content  
                            if (dropdown_content && Array.isArray(dropdown_content.options) && dropdown_content.options.length > 0) {
                                const dropdownBody = botMessageDiv.querySelector("#n8n-dropdown-body");
                                if (dropdownBody) {
                                    const dropdown = createDropdownFromJSON(dropdown_content);
                                    dropdownBody.appendChild(dropdown);

                                    const select = dropdown.querySelector('select');
                                    if (select) {
                                        select.addEventListener('change', (e) => {
                                            const selectedValue = e.target.value;
                                            if (selectedValue) {
                                                sendMessage(selectedValue, [], 'dropdown');
                                            }
                                        });
                                    }
                                }
                            }


                            // Copy button
                            const copyBtn = botMessageDiv.querySelector('.n8n-message-footer .n8n-copy-btn');
                            if (copyBtn) {
                                copyBtn.onclick = () => {
                                    navigator.clipboard.writeText(text);
                                    // console.log('Text copied to clipboard');
                                };
                            }

                            // Like button
                            const likeBtn = botMessageDiv.querySelector('.n8n-like-btn');
                            if (likeBtn) {
                                likeBtn.onclick = () => {
                                    fetch('http://localhost:5000/api/save-feedback', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            sessionId: currentSessionId,
                                            message: rawMessage,
                                            feedback: 'like'
                                        })
                                    }).then(res => res.json())
                                    .then(data => console.log('Feedback saved:', data))
                                    .catch(err => console.error('Error saving feedback:', err));
                                };
                            }

                            // Dislike button
                            const dislikeBtn = botMessageDiv.querySelector('.n8n-dislike-btn');
                            if (dislikeBtn) {
                                dislikeBtn.onclick = () => {
                                    fetch('http://localhost:5000/api/save-feedback', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            sessionId: currentSessionId,
                                            message: rawMessage,
                                            feedback: 'dislike'
                                        })
                                    }).then(res => res.json())
                                    .then(data => console.log('Feedback saved:', data))
                                    .catch(err => console.error('Error saving feedback:', err));
                                };
                            }

                            // Speak button
                            const speakBtn = botMessageDiv.querySelector('.n8n-speak-btn');
                            if (speakBtn) {
                                let isSpeaking = false;

                                speakBtn.onclick = () => {
                                    if (video === "on") {
                                        speakTextWithFallback(text);
                                    } else { 
                                        if (!isSpeaking) {
                                            const utterance = new SpeechSynthesisUtterance(text);
                                            
                                            // Get available voices and find Heera or similar female Indian English voice
                                            const voices = speechSynthesis.getVoices();
                                            const heeraVoice = voices.find(voice => 
                                                voice.name === 'Microsoft Heera - English (India)' || 
                                                voice.name.includes('Heera') && voice.lang === 'en-IN'
                                            );
                                            
                                            // Set voice if found, otherwise use default
                                            if (heeraVoice) {
                                                utterance.voice = heeraVoice;
                                            }
                                            
                                            speechSynthesis.cancel();
                                            speechSynthesis.speak(utterance);

                                            isSpeaking = true;
                                            speakBtn.innerHTML = '⏹';

                                            utterance.onend = utterance.onerror = () => {
                                                isSpeaking = false;
                                                speakBtn.innerHTML = \`
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"/>
                                                    </svg>
                                                \`;
                                            };
                                        } else {
                                            speechSynthesis.cancel();
                                            isSpeaking = false;
                                            speakBtn.innerHTML = \`
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"/>
                                                </svg>
                                            \`;
                                        }
                                    }
                                };
                            }

                            botMessageDiv.scrollTop = botMessageDiv.scrollHeight;
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        }



                        function if_video_is_off(botMessageDiv,rawMessage,table_content, dropdown_content) {
                            let messageBodyHTML = '';
                                let fulltableHTML = '';
                                if (table_content && Array.isArray(table_content.columns) && Array.isArray(table_content.rows)) {
                                    // console.log('Table data is valid, setting up table and download buttons');
                                    messageBodyHTML = \`

                                        <div class="n8n-message-bubble-table" id="n8n-message-body">
                                            <!-- Table will be appended here -->
                                        </div>
                                        <div id="n8n-employee-table"></div>
                                    \`;
                                    fulltableHTML = \`
                                                <button id="n8n-view-table-btn" title="View Full Table">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                        <path d="M3 3h6v2H5v4H3V3zm18 0v6h-2V5h-4V3h6zM3 21v-6h2v4h4v2H3zm18-6v6h-6v-2h4v-4h2z"/>
                                                    </svg>
                                                </button>
                                                <button id="n8n-download-csv-btn" title="Download as CSV">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                                    </svg>
                                                </button>
                                    \`;

                                } else {
                                    // console.warn('Table content is invalid or missing:', table_content);
                                }

                                if (dropdown_content && Array.isArray(dropdown_content.options) && dropdown_content.options.length > 0) {
                                    // console.log('Dropdown data is valid, setting up dropdown');
                                    messageBodyHTML += \`
                                        <div class="n8n-message-bubble-dropdown" id="n8n-dropdown-body">
                                            <!-- Dropdown will be appended here -->
                                        </div>
                                        <div id="n8n-dropdown-container"></div>
                                        \`;
                                }

                                let footerHTML = \`
                                    <div class="n8n-message-footer" style="position: absolute; order: 2;top: -25px;right:40px;">
                                            <button class="n8n-action-btn n8n-copy-btn" title="Copy">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                            <button class="n8n-action-btn n8n-like-btn" title="Like">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1318 2.50389C12.3321 2.15338 12.7235 1.95768 13.124 2.00775L13.5778 2.06447C16.0449 2.37286 17.636 4.83353 16.9048 7.20993L16.354 8.99999H17.0722C19.7097 8.99999 21.6253 11.5079 20.9313 14.0525L19.5677 19.0525C19.0931 20.7927 17.5124 22 15.7086 22H6C4.34315 22 3 20.6568 3 19V12C3 10.3431 4.34315 8.99999 6 8.99999H8C8.25952 8.99999 8.49914 8.86094 8.6279 8.63561L12.1318 2.50389ZM10 20H15.7086C16.6105 20 17.4008 19.3964 17.6381 18.5262L19.0018 13.5262C19.3488 12.2539 18.391 11 17.0722 11H15C14.6827 11 14.3841 10.8494 14.1956 10.5941C14.0071 10.3388 13.9509 10.0092 14.0442 9.70591L14.9932 6.62175C15.3384 5.49984 14.6484 4.34036 13.5319 4.08468L10.3644 9.62789C10.0522 10.1742 9.56691 10.5859 9 10.8098V19C9 19.5523 9.44772 20 10 20ZM7 11V19C7 19.3506 7.06015 19.6872 7.17071 20H6C5.44772 20 5 19.5523 5 19V12C5 11.4477 5.44772 11 6 11H7Z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                            <button class="n8n-action-btn n8n-dislike-btn" title="Dislike">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.8727 21.4961C11.6725 21.8466 11.2811 22.0423 10.8805 21.9922L10.4267 21.9355C7.95958 21.6271 6.36855 19.1665 7.09975 16.7901L7.65054 15H6.93226C4.29476 15 2.37923 12.4921 3.0732 9.94753L4.43684 4.94753C4.91145 3.20728 6.49209 2 8.29589 2H18.0045C19.6614 2 21.0045 3.34315 21.0045 5V12C21.0045 13.6569 19.6614 15 18.0045 15H16.0045C15.745 15 15.5054 15.1391 15.3766 15.3644L11.8727 21.4961ZM14.0045 4H8.29589C7.39399 4 6.60367 4.60364 6.36637 5.47376L5.00273 10.4738C4.65574 11.746 5.61351 13 6.93226 13H9.00451C9.32185 13 9.62036 13.1506 9.8089 13.4059C9.99743 13.6612 10.0536 13.9908 9.96028 14.2941L9.01131 17.3782C8.6661 18.5002 9.35608 19.6596 10.4726 19.9153L13.6401 14.3721C13.9523 13.8258 14.4376 13.4141 15.0045 13.1902V5C15.0045 4.44772 14.5568 4 14.0045 4ZM17.0045 13V5C17.0045 4.64937 16.9444 4.31278 16.8338 4H18.0045C18.5568 4 19.0045 4.44772 19.0045 5V12C19.0045 12.5523 18.5568 13 18.0045 13H17.0045Z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                            <button class="n8n-action-btn n8n-speak-btn" title="Read aloud">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                            \${fulltableHTML}
                                        </div>\`;


                                botMessageDiv.innerHTML = \`
                                    <div class="n8n-bot-message-container">
                                    
                                        <div class="n8n-message-bubble">
                                            <div class="n8n-avatar n8n-bot-avatar"></div>                     
                                            <div class="n8n-message-content">\${formatBotMessage(rawMessage)}</div>
                                            <div class="n8n-message-content1" style="position: absolute; top: -20px; right: 10px; font-size: 10px; color: #666; order: 1;display: flex;align-items: center;left: 0;"                             >
                                            <div class='n8n-message-bot-who'>Aarya</div> \${timeWithDate}
                                            </div>
                                        </div>
                                        \${messageBodyHTML}
                                        \${footerHTML}
                                </div>
                                \`;


                                // Add event listeners for table and download buttons
                                if (table_content && Array.isArray(table_content.columns) && Array.isArray(table_content.rows)) {
                                    // console.log('Appending table to message-body');
                                    const messageBody = botMessageDiv.querySelector("#n8n-message-body");
                                    if (messageBody) {
                                        const table = createTableFromJSON(table_content);
                                        messageBody.appendChild(table);
                                        // console.log('Table appended to message-body:', table);

                                        // Attach listener to view button
                                        const viewTableBtn = botMessageDiv.querySelector('#n8n-view-table-btn');
                                        if (viewTableBtn) {
                                            viewTableBtn.addEventListener('click', () => {
                                                // console.log('View table button clicked, showing popup');
                                                showTablePopup(table_content);
                                            });
                                        } else {
                                            console.error('view-table-btn not found');
                                        }

                                        // ✅ Attach listener to message-body div
                                        messageBody.addEventListener('click', () => {
                                            // console.log('Message body clicked, showing popup');
                                            showTablePopup(table_content);
                                        });

                                        const downloadCsvBtn = botMessageDiv.querySelector('#n8n-download-csv-btn');
                                        if (downloadCsvBtn) {
                                            downloadCsvBtn.addEventListener('click', () => {
                                                // console.log('Download CSV button clicked');
                                                downloadTableAsCSV(table_content);
                                            });
                                        } else {
                                            // console.error('download-csv-btn not found');
                                        }
                                    } else {
                                        // console.error('message-body element not found');
                                    }
                                } else {
                                    // console.warn('Table content is invalid or missing:', table_content);
                                }



                            // Handle dropdown content
                            if (dropdown_content && Array.isArray(dropdown_content.options) && dropdown_content.options.length > 0) {
                                const dropdownBody = botMessageDiv.querySelector("#n8n-dropdown-body");
                                if (dropdownBody) {
                                    const dropdown = createDropdownFromJSON(dropdown_content);
                                    dropdownBody.appendChild(dropdown);

                                    // Add event listener for select element
                                    const select = dropdown.querySelector('select');
                                    if (select) {
                                        // Keep the existing change event
                                        select.addEventListener('change', (e) => {
                                            const selectedValue = e.target.value;
                                            if (selectedValue) {
                                                sendMessage(selectedValue, [], 'dropdown');
                                            }
                                        });

                                        // Add drag-and-drop functionality
                                        Array.from(select.options).forEach(option => {
                                            option.draggable = true;
                                            
                                            option.addEventListener('dragstart', (e) => {
                                                e.dataTransfer.setData('text/plain', option.value);
                                                e.dataTransfer.effectAllowed = 'copy';
                                            });
                                        });
                                    } else {
                                        // Handle button-based dropdowns if needed
                                        const buttons = dropdown.querySelectorAll('button');
                                        buttons.forEach(button => {
                                            button.draggable = true;
                                            button.addEventListener('dragstart', (e) => {
                                                e.dataTransfer.setData('text/plain', button.textContent);
                                                e.dataTransfer.effectAllowed = 'copy';
                                            });
                                        });
                                    }
                                }
                        }
                        
                            // Only get the message text (without icons)
                            const messageText = botMessageDiv.querySelector('.n8n-message-content').innerText;




                            botMessageDiv.querySelector('.n8n-copy-btn').onclick = () => {
                                navigator.clipboard.writeText(messageText);
                            };

                            // Like button
                            botMessageDiv.querySelector('.n8n-like-btn').onclick = () => {
                                fetch('http://localhost:5000/api/save-feedback', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        sessionId: currentSessionId,
                                        message: messageText,
                                        feedback: 'like'
                                    })
                                }).then(res => res.json())
                                .then(data => console.log('Feedback saved:', data))
                                .catch(err => console.error('Error saving feedback:', err));
                            };

                            // Dislike button
                            botMessageDiv.querySelector('.n8n-dislike-btn').onclick = () => {
                                fetch('http://localhost:5000/api/save-feedback', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        sessionId: currentSessionId,
                                        message: messageText,
                                        feedback: 'dislike'
                                    })
                                }).then(res => res.json())
                                .then(data => console.log('Feedback saved:', data))
                                .catch(err => console.error('Error saving feedback:', err));
                            };

                            // Speak button
                            const speakBtn = botMessageDiv.querySelector('.n8n-speak-btn');
                            if (speakBtn) {
                                let isSpeaking = false;

                                speakBtn.onclick = () => {
                                    if (video === "on") {
                                        speakTextWithFallback(text);
                                    } else { 
                                        if (!isSpeaking) {
                                        trimmedText = rawMessage
                                            .replace(/[\\n]{2,}/g, ' ')            
                                            .replace(/!/g, '')                    
                                            .replace(new RegExp('[\\\\p{Emoji_Presentation}\\\\p{Extended_Pictographic}]', 'gu'), '')  
                                            .trim();
                                            const utterance = new SpeechSynthesisUtterance(trimmedText);
                                            
                                            // Get available voices and find Heera or similar female Indian English voice
                                            const voices = speechSynthesis.getVoices();
                                            const heeraVoice = voices.find(voice => 
                                                voice.name === 'Microsoft Heera - English (India)' || 
                                                voice.name.includes('Heera') && voice.lang === 'en-IN'
                                            );
                                            
                                            // Set voice if found, otherwise use default
                                            if (heeraVoice) {
                                                utterance.voice = heeraVoice;
                                            }
                                            
                                            speechSynthesis.cancel();
                                            speechSynthesis.speak(utterance);

                                            isSpeaking = true;
                                            speakBtn.innerHTML = '⏹';

                                            utterance.onend = utterance.onerror = () => {
                                                isSpeaking = false;
                                                speakBtn.innerHTML = \`
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"/>
                                                    </svg>
                                                \`;
                                            };
                                        } else {
                                            speechSynthesis.cancel();
                                            isSpeaking = false;
                                            speakBtn.innerHTML = \`
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z" fill="currentColor"/>
                                                </svg>
                                            \`;
                                        }
                                    }
                                };
                            }

                            messagesContainer.appendChild(botMessageDiv);
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;

                            // Ensure voices are loaded before attempting to use them
                            window.speechSynthesis.onvoiceschanged = () => {
                                window.speechSynthesis.getVoices();
                            };

                            // Handle copy buttons for code blocks
                            messagesContainer.querySelectorAll('.n8n-copy-code-btn').forEach(btn => {
                                btn.onclick = function () {
                                    const codeElem = document.getElementById(this.getAttribute('data-target'));
                                    if (codeElem) {
                                        navigator.clipboard.writeText(codeElem.innerText)
                                            .then(() => {
                                                this.classList.add('n8n-copied');
                                                setTimeout(() => { this.classList.remove('n8n-copied'); }, 1200);
                                            });
                                    }
                                };
                            });
                        }


                        // window.handleCustomEvent = function(type, event) {
                        //     console.log("Event type " + type + ": " + JSON.stringify(event));
                        // }

                        function handleResponse(data) {
                            if (messageSessionId !== currentSessionId) {
                                loadingDiv.remove();
                                return;
                            }
                            
                            if (data != null) {
                                loadingDiv.remove();

                                const rawMessage = Array.isArray(data) ? data[0].output : data.output;
                                // console.log('data:', data);
                                // console.log('Raw message:', rawMessage);

                                if (video === "on") {
                                    speakTextWithFallback(rawMessage);
                                }

                                const customEvent = Array.isArray(data) ? data[0].event : data.event;
                                // if (customEvent && customEvent.type) {
                                //     window.handleCustomEvent(customEvent.type, customEvent);
                                // }

                                // Method 1: Direct call (only works same-origin)
                                if (customEvent && customEvent.type) {
                                    window.parent.handleCustomEvent(customEvent.type, customEvent);
                                }

                                const extra = Array.isArray(data) ? data[0].extra : data.extra;
                                const table_content = extra && extra[0] && extra[0].content;
                                const dropdown_content = extra && extra[1];

                                const timeWithDate = new Date().toLocaleString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                });

                                // Prepare message data object - NO DIV CREATION HERE
                                const messageData = {
                                    timeWithDate: timeWithDate,
                                    table_content: table_content,
                                    dropdown_content: dropdown_content
                                };

                                // Get formatted text
                                const formated_text = formatBotMessage(rawMessage);


                                // Extract msg_id from response (same as the original message)
    const responseMsgId = data.msg_id || data[0]?.msg_id;
    
    // Check if this indicates end of responses
    const isLastResponse = data.is_final || data[0]?.is_final || false;
    
    if (responseMsgId) {
        handleOrderedResponse(responseMsgId, rawMessage, table_content, dropdown_content, isLastResponse);
    } else {
        // Fallback to old behavior if no msg_id
        handleUnorderedResponse(rawMessage, table_content, dropdown_content);
    }





                                // if (video === "on") {
                                //     // Pass only the data to typeWriter - div will be created when typing starts
                                //     typeWriter(messageData, formated_text, 50, rawMessage).then(() => {
                                //         // console.log('Typing completed for message:', formated_text);
                                //     });
                                // }else {
                                //     // // Pass only the data to typeWriter - div will be created when typing starts
                                //     // // typeWriter(messageData, formated_text, 20, rawMessage).then(() => {
                                //     // //     // console.log('Typing completed for message:', formated_text);
                                //     // // });

                                //     // /*      for video off */
                                //     // const botMessageDiv = document.createElement('div');
                                //     // botMessageDiv.className = 'n8n-chat-message bot';
                                //     // if_video_is_off(botMessageDiv,rawMessage,table_content, dropdown_content)



                                //     // Extract msg_id from response
    
                                // }
                            }
                        }
                        
                        
                        
                        
                        
                        
                        
                        function showTablePopup(tableData) {
                        // Try parent window first (for iframes)
                        if (window.top !== window.self) {
                            try {
                            createPopupInWindow(window.top, tableData);
                            return;
                            } catch (e) {
                            console.warn("Parent window access blocked, falling back to iframe");
                            }
                        }
                        
                        // Fallback to current window
                        createPopupInWindow(window, tableData);
                        }

                        function createPopupInWindow(targetWindow, tableData) {
                        // Remove existing popup if any
                        const existingPopup = targetWindow.document.querySelector('.n8n-full-window-popup');
                        if (existingPopup) existingPopup.remove();

                        // Create popup container
                        const popup = targetWindow.document.createElement('div');
                        popup.className = 'n8n-full-window-popup';
                        
                        // Generate table HTML from the data
                        const tableHTML = createTableFromData(tableData);

                        // Generate popup HTML
                        popup.innerHTML = \`
                            <div class="n8n-popup-content">
                            <div class="n8n-popup-header">
                                <h3>\${tableData.title || 'Table Data'}</h3>
                                <button class="n8n-popup-close">&times;</button>
                            </div>
                            <div class="n8n-popup-body">
                                \${tableHTML}
                            </div>
                            </div>
                        \`;

                        // Add to document
                        targetWindow.document.body.appendChild(popup);
                        targetWindow.document.body.style.overflow = 'hidden';

                        // Add styles dynamically
                        addPopupStyles(targetWindow);

                        // Setup close handlers
                        setupCloseHandlers(popup, targetWindow);
                        }

                        function createTableFromData(tableData) {
                        // Check if we have raw data or HTML
                        if (tableData.html) return tableData.html;
                        
                        // Create table from structured data
                        if (tableData.columns && tableData.rows) {
                            let html = '<table class="n8n-data-table"><thead><tr>';
                            
                            // Create headers
                            tableData.columns.forEach(col => {
                            html += \`<th>\${col}</th>\`;
                            });
                            html += '</tr></thead><tbody>';
                            
                            // Create rows
                            tableData.rows.forEach(row => {
                            html += '<tr>';
                            tableData.columns.forEach(col => {
                                html += \`<td>\${row[col] || ''}</td>\`;
                            });
                            html += '</tr>';
                            });
                            
                            html += '</tbody></table>';
                            return html;
                        }
                        
                        // Fallback simple table
                        return \`
                            <table class="n8n-data-table">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Department</th>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>John Doe</td>
                                <td>Marketing</td>
                            </tr>
                            </table>
                        \`;
                        }

                        function addPopupStyles(targetWindow) {
                        const styleId = 'n8n-full-window-popup-styles';
                        if (targetWindow.document.getElementById(styleId)) return;

                        const style = targetWindow.document.createElement('style');
                        style.id = styleId;
                        style.textContent = \`
                            .n8n-full-window-popup {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0,0,0,0.7);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            z-index: 9999;
                            }
                            .n8n-popup-content {
                            background: white;
                            border-radius: 8px;
                            width: 90%;
                            max-width: 90%;
                            max-height: 90vh;
                            overflow: auto;
                            box-shadow: 0 0 20px rgba(0,0,0,0.3);
                            }
                            .n8n-popup-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 15px 20px;
                            border-bottom: 1px solid #eee;
                            position: sticky;
                            top: 0;
                            background: white;
                            }
                            .n8n-popup-close {
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            line-height: 1;
                            }
                            .n8n-popup-body {
                            padding: 20px;
                            overflow-x: auto;
                            }
                            .n8n-data-table {
                            width: 100%;
                            border-collapse: collapse;
                            }
                            .n8n-data-table th, .n8n-data-table td {
                            padding: 10px 15px;
                            border: 1px solid #ddd;
                            text-align: left;
                            }
                            .n8n-data-table th {
                            background-color: #f5f5f5;
                            position: sticky;
                            top: 0;
                            }
                        \`;
                        targetWindow.document.head.appendChild(style);
                        }

                        function setupCloseHandlers(popup, targetWindow) {
                        const closePopup = () => {
                            popup.remove();
                            targetWindow.document.body.style.overflow = '';
                        };

                        // Close button
                        popup.querySelector('.n8n-popup-close').addEventListener('click', closePopup);
                        
                        // Click outside
                        popup.addEventListener('click', (e) => {
                            if (e.target === popup) closePopup();
                        });

                        // Escape key
                        targetWindow.document.addEventListener('keydown', (e) => {
                            if (e.key === 'Escape') closePopup();
                        });
                        }



                        // // Function to create and show the table popup
                        // function showTablePopup(tableData) {
                        //     // Remove existing popup if it exists
                        //     const existingBackdrop = document.querySelector('.n8n-dialog-backdrop');
                        //     if (existingBackdrop) {
                        //         existingBackdrop.remove();
                        //     }

                        //     const chatContainer = document.querySelector('.n8n-chat-container')
                        //     // console.log('chatContainer:', chatContainer);

                        //     const backdrop = document.createElement('div');
                        //     backdrop.className = 'n8n-dialog-backdrop';
                            
                        //     chatContainer.appendChild(backdrop); // Append to body instead of chatContainer

                        //     const dialog = document.createElement('div');
                        //     dialog.className = 'n8n-table-dialog';
                            
                        //     dialog.innerHTML = 
                        //         '<div class="n8n-dialog-header">' +
                        //             '<h3>' + (tableData.title || 'Table Data') + '</h3>' +
                        //             '<button class="n8n-dialog-close-button">×</button>' +
                        //         '</div>' +
                        //         '<div class="n8n-table-container"></div>';

                        //     backdrop.appendChild(dialog);

                        //     const tableContainer = dialog.querySelector('.n8n-table-container');
                        //     const table = createTableFromJSON(tableData, true);
                        //     tableContainer.appendChild(table);

                        //     const closeDialog = () => {
                        //         dialog.remove();
                        //         backdrop.remove();
                        //         document.removeEventListener('keydown', handleEscape);
                        //     };

                        //     dialog.querySelector('.n8n-dialog-close-button').addEventListener('click', closeDialog);
                        //     backdrop.addEventListener('click', (e) => {
                        //         if (e.target === backdrop) {
                        //             closeDialog();
                        //         }
                        //     });

                        //     // Add escape key handler
                        //     const handleEscape = (e) => {
                        //         if (e.key === 'Escape') {
                        //             closeDialog();
                        //         }
                        //     };
                        //     document.addEventListener('keydown', handleEscape);
                        // }





                        function createTableFromJSON(data, isPopup = false) {
                            const tableContainer = document.createElement("div");
                            tableContainer.className = "n8n-table-container";
                            if (!isPopup) tableContainer.style.cursor = "pointer";

                            const table = document.createElement("table");
                            table.border = "1";
                            if (!isPopup) {
                                table.style.width = "100%";
                                table.style.boxSizing = "border-box";
                                table.style.borderCollapse = "collapse";
                                table.style.marginLeft = "0px";
                            }

                            // === Column truncation ===
                            let columnsToRender;
                            if (isPopup || data.columns.length <= 6) {
                                columnsToRender = data.columns;
                            } else {
                                const firstCols = data.columns.slice(0, 2);
                                const lastCols = data.columns.slice(-2);
                                columnsToRender = [...firstCols, '...', ...lastCols];
                            }

                            // === Header ===
                            const thead = document.createElement("thead");
                            const headerRow = document.createElement("tr");
                            columnsToRender.forEach(col => {
                                const th = document.createElement("th");
                                th.innerText = col;
                                if (!isPopup) {
                                    th.style.padding = "8px";
                                    th.style.backgroundColor = "#f0f0f0";
                                    th.style.fontSize = "14px";
                                    th.style.whiteSpace = "normal";
                                    th.style.wordBreak = "break-word";
                                }
                                headerRow.appendChild(th);
                            });
                            thead.appendChild(headerRow);
                            table.appendChild(thead);

                            // === Row truncation ===
                            let rowsToRender;
                            if (isPopup || data.rows.length <= 3) {
                                rowsToRender = data.rows;
                            } else {
                                const firstRows = data.rows.slice(0, 2);
                                const lastRow = data.rows[data.rows.length - 1];
                                rowsToRender = [...firstRows, '...', lastRow];
                            }

                            // === Body ===
                            const tbody = document.createElement("tbody");

                            rowsToRender.forEach(row => {
                                const tr = document.createElement("tr");

                                if (row === '...') {
                                    // Create placeholder row with individual boxed cells
                                    columnsToRender.forEach(col => {
                                        const td = document.createElement("td");
                                        td.innerText = '...';
                                        td.className = 'ellipsis';
                                        if (!isPopup) {
                                            td.style.textAlign = 'center';
                                            td.style.color = '#888';
                                            td.style.fontStyle = 'italic';
                                            td.style.padding = "8px";
                                            td.style.fontSize = "14px";
                                        }
                                        tr.appendChild(td);
                                    });
                                } else {
                                    columnsToRender.forEach(col => {
                                        const td = document.createElement("td");

                                        if (col === '...') {
                                            td.innerText = '...';
                                            td.className = 'ellipsis';
                                            if (!isPopup) {
                                                td.style.textAlign = 'center';
                                                td.style.color = '#888';
                                                td.style.fontStyle = 'italic';
                                                td.style.padding = "8px";
                                                td.style.fontSize = "14px";
                                                td.style.whiteSpace = "normal";
                                                td.style.wordBreak = "break-word";
                                            }
                                        } else {
                                            td.innerText = row[col] || '';
                                            if (!isPopup) {
                                                td.style.padding = "8px";
                                                td.style.fontSize = "14px";
                                                td.style.whiteSpace = "normal";
                                                td.style.wordBreak = "break-word";
                                            }
                                        }

                                        tr.appendChild(td);
                                    });
                                }

                                tbody.appendChild(tr);
                            });

                            table.appendChild(tbody);
                            return table;
                        }

                        // Function to download table as CSV
                        function downloadTableAsCSV(tableData) {
                            // console.log('Generating CSV for table data:', tableData);
                            
                            // Escape CSV values to handle commas and quotes
                            const escapeCsvValue = (value) => {
                                if (value === null || value === undefined) return '';
                                const str = String(value);
                                if (str.includes(',') || str.includes('"') || str.includes('\\n')) {
                                    return \`"\${str.replace(/"/g, '""')}"\`;
                                }
                                return str;
                            };

                            // Create CSV content
                            const csvRows = [];
                            // Add header row
                            csvRows.push(tableData.columns.map(escapeCsvValue).join(','));
                            // Add data rows
                            tableData.rows.forEach(row => {
                                const rowData = tableData.columns.map(col => escapeCsvValue(row[col]));
                                csvRows.push(rowData.join(','));
                            });
                            const csvContent = csvRows.join('\\n');

                            // Create a downloadable file
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.setAttribute('href', url);
                            link.setAttribute('download', \`\${tableData.title || 'table_data'}.csv\`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            // console.log('CSV download initiated');
                        }




                        function createDropdownFromJSON(data) {
                            // console.log('Creating dropdown or buttons from data:', data);

                            const container = document.createElement('div');
                            container.className = 'n8n-options-container';
                            container.style.marginTop = '5px';
                            
                            // console.log('Option length:', data.options.length);

                            // // Add a label for both buttons and dropdown
                            // const label = document.createElement('label');
                            // // label.innerText = 'Make a choice from the list below';
                            // label.style.fontWeight = 'bold';
                            // label.style.position = 'center';
                            // label.style.display = 'block';
                            // label.style.marginBottom = '10px';
                            // label.style.marginTop = '10px';

                            // container.appendChild(label);


                            // Check the number of options
                            if (data.options.length < 6) {
                                // Display as buttons
                                // container.style.marginTop = '-px';
                                if (data.label){
                                    const labelElement = document.createElement('div');
                                    labelElement.textContent  = data.label// Create a header label element
                                    labelElement.style.fontWeight = 'bold';
                                    labelElement.style.margin = '5px 5px 5px 20px';
                                    labelElement.style.fontSize = '14px';

                                    // Insert the label before the container
                                    container.prepend(labelElement);

                                    // Reset any inline style if needed
                                    container.style = '';
                                }

                                container.style.marginBottom = '-11px';
                                container.style.display = 'flex';
                                container.style.gap = '15px'; // Space between buttons
                                container.style.flexWrap = 'wrap'; // Allow buttons to wrap if needed
                                container.style.background = 'rgb(241, 241, 241)'; // Light background like in the image
                                container.style.padding = '5px 0 5px 0px'; // Add padding for better appearance
                                container.style.borderRadius = '0px 0px 12px 12px';
                                
                                
                                
                                data.options.forEach(option => {
                                    const button = document.createElement('button');
                                    button.innerText = option;
                                    button.style.padding = '8px 15px';
                                    button.style.borderRadius = '20px'; // Rounded edges like in the image
                                    button.style.border = '0px   #103278';
                                    button.style.backgroundColor = '#fff';
                                    button.style.color = '#000';
                                    button.style.cursor = 'pointer';
                                    button.style.fontSize = '14px';
                                    button.style.fontWeight = '500';
                                    button.style.transition = 'background-color 0.3s, transform 0.2s';
                                    button.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.52)';

                                    // Add hover effect
                                    button.onmouseover = () => {
                                        button.style.backgroundColor = 'rgb(9, 55, 148)';
                                        button.style.color = '#fff';
                                    };
                                    button.onmouseout = () => {
                                        button.style.backgroundColor = '#fff';
                                        button.style.color = '#000';
                                    };

                                    // Add click event to send the selected option as a message
                                    button.addEventListener('click', () => {
                                        // console.log('Button clicked:', option);
                                        sendMessage(option, [], 'button');
                                    });

                                    container.appendChild(button);
                                });
                            } else {
                                // Display as dropdown
                                container.style.background = 'rgb(241, 241, 241)';

                                const select = document.createElement('select');
                                select.style.marginLeft = '35px';
                                // select.style.position = 'center';
                                select.style.marginRight = '-20px';
                                select.style.width = '80%';
                                select.style.padding = '8px';
                                select.style.borderRadius = '12px';
                                select.style.border = '0.5px solid #103278';
                                // select.style.fontSize = '14px';

                                // Add default option
                                const defaultOption = document.createElement('option');
                                defaultOption.value = '';
                                defaultOption.text = '--- select ---';
                                defaultOption.disabled = true;
                                defaultOption.selected = true;
                                select.appendChild(defaultOption);

                                // Add options from data
                                data.options.forEach(option => {
                                    const opt = document.createElement('option');
                                    opt.value = option;
                                    opt.text = option;
                                    select.appendChild(opt);
                                });

                                container.appendChild(select);
                            }

                            return container;
                        }

                    }
                    catch (error) {
                                loadingDiv.remove();
                                if (messageSessionId === currentSessionId && error.name !== 'AbortError') {
                                    const errorMessageDiv = document.createElement('div');
                                    errorMessageDiv.className = 'chat-message bot';
                                    errorMessageDiv.innerHTML = '<div class="avatar bot-avatar"></div><div class="n8n-message-bubble">Sorry, there was an error processing your request. Please try again.</div>';
                                    messagesContainer.appendChild(errorMessageDiv);
                                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                }
            }




                




            function refreshChat() {
                messagesContainer.innerHTML = '';
                textarea.value = '';
                filePreviewContainer.innerHTML = '';
                currentFiles = [];
                abortController.abort();
                abortController = new AbortController();
                currentSessionId = generateUUID();
                startNewConversation();
                updateButtonVisibility();
            }





            function showConfirmationDialog() {
                const backdrop = document.createElement('div');
                backdrop.className = 'dialog-backdrop';
                document.querySelector('.n8n-chat-container').appendChild(backdrop);

                const dialog = document.createElement('div');
                dialog.className = 'n8n-confirmation-dialog';
                dialog.innerHTML = '<button class="dialog-close-button">×</button><h3>Restart Conversation</h3><p>Are you sure you want to restart a new conversation?</p><div class="dialog-buttons"><button class="cancel-button">Cancel</button><button class="restart-button">Restart</button></div>';
                document.querySelector('.n8n-chat-container').appendChild(dialog);

                const closeDialog = () => {
                    dialog.remove();
                    backdrop.remove();
                };

                dialog.querySelector('.cancel-button').addEventListener('click', closeDialog);
                dialog.querySelector('.dialog-close-button').addEventListener('click', closeDialog);
                dialog.querySelector('.restart-button').addEventListener('click', () => {
                    closeDialog();
                    refreshChat();
                });
            }

            function renderFilePreviews() {
                filePreviewContainer.innerHTML = '';

                currentFiles.forEach((file, index) => {
                    const previewDiv = document.createElement('div');
                    const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.webm');
                    
                    if (isAudio) {
                        const fileUrl = URL.createObjectURL(file);
                        previewDiv.className = 'n8n-file-preview audio';
                        previewDiv.innerHTML = '<audio controls style="width: 100%; height: 40px;"><source src="' + fileUrl + '" type="audio/webm"></audio><span class="file-preview-name">' + file.name + '</span><button class="file-preview-remove" data-index="' + index + '">×</button>';
                    } else {
                        previewDiv.className = 'file-preview';
                        previewDiv.innerHTML = '<span class="file-preview-name">' + file.name + '</span><button class="file-preview-remove" data-index="' + index + '">×</button>';
                    }

                    filePreviewContainer.appendChild(previewDiv);
                });
            }

            fileUploadButton.addEventListener('click', () => {

                // console.log('File upload button clicked');
                fileInput.click();
            });


            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                currentFiles = [...currentFiles, ...files];
                renderFilePreviews();
                updateButtonVisibility();
            });

            // sendButton.addEventListener('click', () => {
            //     const message = textarea.value.trim();
            //     if (message || currentFiles.length > 0) {
            //         sendMessage(message, currentFiles);
            //         textarea.value = '';
            //         autoResizeTextarea(textarea);
            //         currentFiles = [];
            //         updateButtonVisibility();
            //     }
            // });

            // Your existing send button code - just add one line:
            sendButton.addEventListener('click', () => {
                const message = textarea.value.trim();
                if (message || currentFiles.length > 0) {
                    // ADD THIS LINE - Save message to history
                    dynamicHistory.addMessage(message);
                    
                    sendMessage(message, currentFiles);
                    textarea.value = '';
                    autoResizeTextarea(textarea);
                    currentFiles = [];
                    updateButtonVisibility();
                    renderFilePreviews();
                }
            });














            textarea.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const message = textarea.value.trim();
                    if (message || currentFiles.length > 0) {
                        sendMessage(message, currentFiles);
                        textarea.value = '';
                        autoResizeTextarea(textarea);
                        currentFiles = [];
                        updateButtonVisibility();
                    }
                }
            });

            textarea.addEventListener('input', function() {
                autoResizeTextarea(this);
                updateButtonVisibility();
            });
                

            // Initialize Speech Recognition (with fallback for different browsers)
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true; // Keep recognizing until stopped
                recognition.interimResults = true; // Show interim results while speaking
                recognition.lang = 'en-US'; // Set language to English (you can change this)



                const messagesContainer = document.querySelector('.n8n-chat-widget .n8n-chat-messages');
                let isRecording = false; // Track if currently recording
                let mediaRecorder = null;
                let audioChunks = [];
                let stream = null;
                let finalTranscript = ''; // Store the final transcript to prevent clearing

            

                // Add input event listener to resize textarea on manual typing
                textarea.addEventListener('input', () => {
                    autoResizeTextarea(textarea);
                });

                // Initial resize in case there's pre-filled content
                autoResizeTextarea(textarea);

                    // Single event listener for the mic button
                micButton.addEventListener('click', async () => {
                    if (!isRecording) {
                        try {
                        // console.log('Speech Recognition API is available');
                        // console.log('micButton:', micButton);
                        // console.log('textarea:', textarea);
                
                            // Request microphone access once
                            if (!stream) {
                                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            }

                            // Set up MediaRecorder for audio recording
                            mediaRecorder = new MediaRecorder(stream);
                            audioChunks = [];

                            mediaRecorder.ondataavailable = (e) => {
                                if (e.data.size > 0) {
                                    audioChunks.push(e.data);
                                    // console.log('Audio chunk received, size:', e.data.size);
                                } else {
                                    // console.log('Empty audio chunk received');
                                }
                            };

                            mediaRecorder.onstop = () => {
                                // console.log('MediaRecorder stopped');
                                isRecording = false;
                                micButton.innerHTML = \`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 512.000000 512.000000" fill="#0099ff">
                                                <path d="M0 0 C1.51671886 1.26424817 3.0593383 2.49722026 4.60253906 3.72900391 C19.28864031 15.68237492 33.1902857 29.28168978 44.33349609 44.62451172 C45.62066708 46.38127784 46.9453607 48.10442915 48.27832031 49.82666016 C72.45591287 81.38831197 88.32687017 120.12752123 94.56347656 159.30322266 C94.72428711 160.30675781 94.88509766 161.31029297 95.05078125 162.34423828 C99.15307909 189.19102865 98.85784384 216.50430539 94.56347656 243.30322266 C94.40782227 244.28097656 94.25216797 245.25873047 94.09179688 246.26611328 C83.83070262 307.66882901 48.55341729 366.91574741 -1.70214844 404.01318359 C-3.45613547 405.31781021 -5.18141301 406.65442649 -6.90527344 407.99853516 C-58.49573872 447.71022316 -126.64664264 463.36497081 -190.72607422 455.71557617 C-232.1290536 450.25493496 -271.20213463 435.19680584 -305.43652344 411.30322266 C-306.15565918 410.80177734 -306.87479492 410.30033203 -307.61572266 409.78369141 C-318.02591578 402.43816999 -327.32460976 394.18751632 -336.43652344 385.30322266 C-337.07509277 384.69043457 -337.71366211 384.07764648 -338.37158203 383.44628906 C-346.67181637 375.47831329 -354.27219981 367.3099454 -361.12597656 358.0625 C-362.45449434 356.27909852 -363.81012381 354.5191275 -365.17089844 352.76025391 C-404.6647793 301.10368044 -421.02435224 232.73318877 -412.84033203 168.60058594 C-412.40469949 165.49544331 -411.93264328 162.39924907 -411.43652344 159.30322266 C-411.28086914 158.32546875 -411.12521484 157.34771484 -410.96484375 156.34033203 C-402.66879853 106.69653249 -378.42754956 60.28925426 -343.43652344 24.30322266 C-342.82550781 23.66642578 -342.21449219 23.02962891 -341.58496094 22.37353516 C-333.27930111 13.73697254 -324.82481479 5.71874882 -315.1796875 -1.40234375 C-313.40167473 -2.7226552 -311.64898673 -4.07204745 -309.89746094 -5.42724609 C-231.90738178 -65.10203185 -121.53510399 -69.85830349 0 0 Z " fill="#2F6FDD" transform="translate(414.4365234375,54.69677734375)"/>
                                                <path d="M0 0 C12.42224174 10.39773082 19.76584284 22.52302065 23.8125 38.1875 C23.98958874 38.80172569 24.16667747 39.41595139 24.34913254 40.04878998 C24.87862699 42.49271446 24.94449123 44.71825806 24.95294189 47.21936035 C24.95865204 48.23404388 24.96436218 49.24872742 24.97024536 50.29415894 C24.97192215 51.95549362 24.97192215 51.95549362 24.97363281 53.65039062 C24.97859772 54.82163483 24.98356262 55.99287903 24.98867798 57.19961548 C25.00077656 60.41083164 25.0082431 63.62201141 25.01268864 66.83324623 C25.01562559 68.84415082 25.01973173 70.85504979 25.02419281 72.86595154 C25.03786635 79.17067833 25.04753158 85.47539218 25.0513947 91.78013277 C25.05586392 99.03259997 25.07335924 106.28487762 25.1023953 113.53728724 C25.12410805 119.15789494 25.1341042 124.77844973 25.13543582 130.39909887 C25.13647778 133.74854452 25.1437283 137.09767117 25.16025543 140.44709778 C25.1774211 144.1946929 25.17540931 147.94183402 25.16894531 151.68945312 C25.1781601 152.78081573 25.18737488 153.87217834 25.1968689 154.99661255 C25.14152213 165.30482332 23.00793096 174.98339502 18.3125 184.1875 C17.97210693 184.859021 17.63171387 185.53054199 17.28100586 186.22241211 C8.18571212 203.25357726 -8.13754902 214.27458502 -26.1875 220.1875 C-40.96035048 223.42695866 -57.47272057 222.52258239 -71.1875 216.1875 C-72.15429688 215.7646875 -73.12109375 215.341875 -74.1171875 214.90625 C-89.98826543 207.17303356 -102.02001346 192.36911802 -108.50275135 176.19633675 C-111.19925232 168.28565266 -111.48105258 160.32587591 -111.4621582 152.04345703 C-111.46726913 150.87133667 -111.47238007 149.69921631 -111.47764587 148.49157715 C-111.49146955 144.64276935 -111.49059054 140.79414207 -111.48828125 136.9453125 C-111.49059497 134.9344191 -111.49409906 132.92353004 -111.497688 130.91263855 C-111.50874341 124.59782809 -111.50924309 118.28307714 -111.50317383 111.96826172 C-111.49713751 105.48463012 -111.50944538 99.00121572 -111.5307439 92.51762116 C-111.54843871 86.9223599 -111.55434891 81.32716728 -111.55110615 75.73187912 C-111.54930558 72.40266223 -111.55314744 69.07372314 -111.56582069 65.74451065 C-111.57823904 62.02628374 -111.57136063 58.30855178 -111.55981445 54.59033203 C-111.56745819 53.50839569 -111.57510193 52.42645935 -111.58297729 51.31173706 C-111.45647745 32.76193832 -103.84802264 17.3438609 -91.171875 4.078125 C-65.69586911 -20.26561396 -27.45332059 -20.96435391 0 0 Z " fill="#FEFEFE" transform="translate(299.1875,103.8125)"/>
                                                <path d="M0 0 C2.87029869 1.79393668 4.49131638 2.98263276 6 6 C6.19375772 8.12291066 6.38273173 10.24640357 6.54345703 12.37207031 C8.67955691 39.55053259 18.92903508 63.9102293 40 82 C60.17214379 97.7804004 84.37234267 105.60533967 110 103 C136.11046367 99.09316278 159.09631304 86.76179985 175.1953125 65.5859375 C184.9892939 51.55213731 190.84389608 36.36245029 192.484375 19.2890625 C192.56212158 18.48428467 192.63986816 17.67950684 192.7199707 16.8503418 C192.86174081 15.2778233 192.98614651 13.7036127 193.09057617 12.12817383 C193.50778592 7.22582299 194.4871831 4.47282278 198 1 C201.47263273 -0.73631636 205.21193013 -0.60190402 209 0 C211.75569447 2.18159145 213.43588747 3.87177494 215 7 C217.33691368 35.85816665 204.52083635 63.88912672 186.75390625 85.765625 C167.41565338 108.24074242 140.16137552 121.08386245 111 124 C111 134.23 111 144.46 111 155 C114.26261719 154.96519531 117.52523437 154.93039062 120.88671875 154.89453125 C124.05069097 154.87112719 127.2146535 154.8529154 130.37866211 154.83520508 C132.57564621 154.82012948 134.77260026 154.79966574 136.96948242 154.77368164 C140.12947 154.73724498 143.28905924 154.72026116 146.44921875 154.70703125 C147.91979988 154.68380547 147.91979988 154.68380547 149.42008972 154.66011047 C155.66306293 154.65857381 159.0765136 155.46631179 163.875 159.625 C165.67939414 163.43427651 165.09501562 167.00209061 164 171 C161.75410675 173.99452434 160.55130633 174.81623122 157 176 C155.44024881 176.09947413 153.87665187 176.14350139 152.31376648 176.15390015 C150.86914536 176.16680084 150.86914536 176.16680084 149.39533997 176.17996216 C148.34021713 176.18422211 147.2850943 176.18848206 146.19799805 176.19287109 C145.08553711 176.20104858 143.97307617 176.20922607 142.8269043 176.21765137 C139.13851461 176.2425029 135.45016337 176.2590196 131.76171875 176.2734375 C130.50321421 176.27876118 129.24470966 176.28408485 127.94806862 176.28956985 C122.65940906 176.31079697 117.37075527 176.32992729 112.08206463 176.34119225 C104.5099254 176.35742891 96.93829944 176.3906072 89.36635369 176.44759309 C83.39537731 176.49099426 77.42451524 176.50694035 71.45337868 176.51332474 C68.91562048 176.52004887 66.3778701 176.53530082 63.84021568 176.55921555 C60.28980701 176.59076918 56.74069714 176.59091792 53.19018555 176.58349609 C52.14113541 176.59990143 51.09208527 176.61630676 50.01124573 176.63320923 C45.40157823 176.59374052 42.05074243 176.56127426 38.3618927 173.60391235 C35.37556546 170.31158058 34.91720764 168.52249614 34.6875 164.22265625 C35.23528501 160.32653534 37.16101017 158.64092077 40 156 C42.39582346 154.80208827 43.86777538 154.8793256 46.54150391 154.88647461 C47.48232819 154.88655014 48.42315247 154.88662567 49.39248657 154.88670349 C50.41023163 154.89186478 51.42797668 154.89702606 52.4765625 154.90234375 C54.03713882 154.90446617 54.03713882 154.90446617 55.62924194 154.90663147 C58.96119021 154.91224134 62.29307195 154.92479553 65.625 154.9375 C67.88020736 154.94251373 70.13541578 154.94707686 72.390625 154.95117188 C77.92712975 154.96136426 83.46349017 154.9809378 89 155 C89 144.77 89 134.54 89 124 C83.555 123.505 83.555 123.505 78 123 C50.2450228 118.50606785 24.57550623 101.40169471 8 79 C-6.17032116 59.1639511 -18.46131918 31.97360396 -15 7 C-11.61041298 0.09160417 -7.24944534 -1.06833931 0 0 Z " fill="#FCFDFE" transform="translate(156,247)"/>
                                            </svg>\`;
                                micButton.classList.remove('n8n-recording');

                                if (audioChunks.length === 0) {
                                    // console.log('No audio recorded');
                                    return;
                                }

                                // const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                                // const audioFile = new File([audioBlob], \`recording-${Date.now()}.webm\`, {
                                //     type: 'audio/webm'
                                // });

                                // console.log('Audio file created:', audioFile);

                                // Add to current files and show preview (but do not send yet)
                                // currentFiles = [audioFile];
                                currentFiles = [];
                                renderFilePreviews();
                                updateButtonVisibility();

                                // Stop the audio stream
                                stream.getTracks().forEach(track => track.stop());
                                stream = null;
                            };

                            // Start audio recording
                            mediaRecorder.start();
                            // console.log('MediaRecorder started');

                            // Start speech recognition immediately after
                            try {
                                finalTranscript = ''; // Reset transcript only when starting a new session
                                recognition.start();
                                // console.log('Speech recognition started');
                            } catch (error) {
                                console.error('Speech recognition start error:', error);
                                textarea.value += \`\\n[Error starting speech recognition: \${error.message}]\`;
                                autoResizeTextarea(textarea); // Resize after error message
                            }

                            // Update mic button UI
                            micButton.innerHTML = \`
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
                                    <path fill="currentColor" d="M6 6h12v12H6z"/>
                                </svg>
                            \`;
                            micButton.title = 'Stop recording';
                            micButton.classList.add('n8n-recording');
                            isRecording = true;

                        } catch (error) {
                            console.error('Error accessing microphone:', error);
                            const errorMessageDiv = document.createElement('div');
                            errorMessageDiv.className = 'n8n-chat-message bot';
                            errorMessageDiv.innerHTML = \`
                                <div class="n8n-avatar n8n-bot-avatar"></div>
                                <div class="n8n-message-bubble">Sorry, I couldn't access your microphone. Please check permissions and try again.</div>
                            \`;
                            messagesContainer.appendChild(errorMessageDiv);
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            stream = null;
                        }
                    } else {
                        // Stop both recording and speech recognition
                        try {
                            if (mediaRecorder && mediaRecorder.state === 'recording') {
                                mediaRecorder.stop();
                            }
                            recognition.stop();
                            isRecording = false; // Ensure isRecording is set to false to prevent restarts
                        } catch (error) {
                            console.error('Error stopping recording or recognition:', error);
                        }

                        micButton.innerHTML = \`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 512.000000 512.000000" fill="#0099ff">
                                                <path d="M0 0 C1.51671886 1.26424817 3.0593383 2.49722026 4.60253906 3.72900391 C19.28864031 15.68237492 33.1902857 29.28168978 44.33349609 44.62451172 C45.62066708 46.38127784 46.9453607 48.10442915 48.27832031 49.82666016 C72.45591287 81.38831197 88.32687017 120.12752123 94.56347656 159.30322266 C94.72428711 160.30675781 94.88509766 161.31029297 95.05078125 162.34423828 C99.15307909 189.19102865 98.85784384 216.50430539 94.56347656 243.30322266 C94.40782227 244.28097656 94.25216797 245.25873047 94.09179688 246.26611328 C83.83070262 307.66882901 48.55341729 366.91574741 -1.70214844 404.01318359 C-3.45613547 405.31781021 -5.18141301 406.65442649 -6.90527344 407.99853516 C-58.49573872 447.71022316 -126.64664264 463.36497081 -190.72607422 455.71557617 C-232.1290536 450.25493496 -271.20213463 435.19680584 -305.43652344 411.30322266 C-306.15565918 410.80177734 -306.87479492 410.30033203 -307.61572266 409.78369141 C-318.02591578 402.43816999 -327.32460976 394.18751632 -336.43652344 385.30322266 C-337.07509277 384.69043457 -337.71366211 384.07764648 -338.37158203 383.44628906 C-346.67181637 375.47831329 -354.27219981 367.3099454 -361.12597656 358.0625 C-362.45449434 356.27909852 -363.81012381 354.5191275 -365.17089844 352.76025391 C-404.6647793 301.10368044 -421.02435224 232.73318877 -412.84033203 168.60058594 C-412.40469949 165.49544331 -411.93264328 162.39924907 -411.43652344 159.30322266 C-411.28086914 158.32546875 -411.12521484 157.34771484 -410.96484375 156.34033203 C-402.66879853 106.69653249 -378.42754956 60.28925426 -343.43652344 24.30322266 C-342.82550781 23.66642578 -342.21449219 23.02962891 -341.58496094 22.37353516 C-333.27930111 13.73697254 -324.82481479 5.71874882 -315.1796875 -1.40234375 C-313.40167473 -2.7226552 -311.64898673 -4.07204745 -309.89746094 -5.42724609 C-231.90738178 -65.10203185 -121.53510399 -69.85830349 0 0 Z " fill="#2F6FDD" transform="translate(414.4365234375,54.69677734375)"/>
                                                <path d="M0 0 C12.42224174 10.39773082 19.76584284 22.52302065 23.8125 38.1875 C23.98958874 38.80172569 24.16667747 39.41595139 24.34913254 40.04878998 C24.87862699 42.49271446 24.94449123 44.71825806 24.95294189 47.21936035 C24.95865204 48.23404388 24.96436218 49.24872742 24.97024536 50.29415894 C24.97192215 51.95549362 24.97192215 51.95549362 24.97363281 53.65039062 C24.97859772 54.82163483 24.98356262 55.99287903 24.98867798 57.19961548 C25.00077656 60.41083164 25.0082431 63.62201141 25.01268864 66.83324623 C25.01562559 68.84415082 25.01973173 70.85504979 25.02419281 72.86595154 C25.03786635 79.17067833 25.04753158 85.47539218 25.0513947 91.78013277 C25.05586392 99.03259997 25.07335924 106.28487762 25.1023953 113.53728724 C25.12410805 119.15789494 25.1341042 124.77844973 25.13543582 130.39909887 C25.13647778 133.74854452 25.1437283 137.09767117 25.16025543 140.44709778 C25.1774211 144.1946929 25.17540931 147.94183402 25.16894531 151.68945312 C25.1781601 152.78081573 25.18737488 153.87217834 25.1968689 154.99661255 C25.14152213 165.30482332 23.00793096 174.98339502 18.3125 184.1875 C17.97210693 184.859021 17.63171387 185.53054199 17.28100586 186.22241211 C8.18571212 203.25357726 -8.13754902 214.27458502 -26.1875 220.1875 C-40.96035048 223.42695866 -57.47272057 222.52258239 -71.1875 216.1875 C-72.15429688 215.7646875 -73.12109375 215.341875 -74.1171875 214.90625 C-89.98826543 207.17303356 -102.02001346 192.36911802 -108.50275135 176.19633675 C-111.19925232 168.28565266 -111.48105258 160.32587591 -111.4621582 152.04345703 C-111.46726913 150.87133667 -111.47238007 149.69921631 -111.47764587 148.49157715 C-111.49146955 144.64276935 -111.49059054 140.79414207 -111.48828125 136.9453125 C-111.49059497 134.9344191 -111.49409906 132.92353004 -111.497688 130.91263855 C-111.50874341 124.59782809 -111.50924309 118.28307714 -111.50317383 111.96826172 C-111.49713751 105.48463012 -111.50944538 99.00121572 -111.5307439 92.51762116 C-111.54843871 86.9223599 -111.55434891 81.32716728 -111.55110615 75.73187912 C-111.54930558 72.40266223 -111.55314744 69.07372314 -111.56582069 65.74451065 C-111.57823904 62.02628374 -111.57136063 58.30855178 -111.55981445 54.59033203 C-111.56745819 53.50839569 -111.57510193 52.42645935 -111.58297729 51.31173706 C-111.45647745 32.76193832 -103.84802264 17.3438609 -91.171875 4.078125 C-65.69586911 -20.26561396 -27.45332059 -20.96435391 0 0 Z " fill="#FEFEFE" transform="translate(299.1875,103.8125)"/>
                                                <path d="M0 0 C2.87029869 1.79393668 4.49131638 2.98263276 6 6 C6.19375772 8.12291066 6.38273173 10.24640357 6.54345703 12.37207031 C8.67955691 39.55053259 18.92903508 63.9102293 40 82 C60.17214379 97.7804004 84.37234267 105.60533967 110 103 C136.11046367 99.09316278 159.09631304 86.76179985 175.1953125 65.5859375 C184.9892939 51.55213731 190.84389608 36.36245029 192.484375 19.2890625 C192.56212158 18.48428467 192.63986816 17.67950684 192.7199707 16.8503418 C192.86174081 15.2778233 192.98614651 13.7036127 193.09057617 12.12817383 C193.50778592 7.22582299 194.4871831 4.47282278 198 1 C201.47263273 -0.73631636 205.21193013 -0.60190402 209 0 C211.75569447 2.18159145 213.43588747 3.87177494 215 7 C217.33691368 35.85816665 204.52083635 63.88912672 186.75390625 85.765625 C167.41565338 108.24074242 140.16137552 121.08386245 111 124 C111 134.23 111 144.46 111 155 C114.26261719 154.96519531 117.52523437 154.93039062 120.88671875 154.89453125 C124.05069097 154.87112719 127.2146535 154.8529154 130.37866211 154.83520508 C132.57564621 154.82012948 134.77260026 154.79966574 136.96948242 154.77368164 C140.12947 154.73724498 143.28905924 154.72026116 146.44921875 154.70703125 C147.91979988 154.68380547 147.91979988 154.68380547 149.42008972 154.66011047 C155.66306293 154.65857381 159.0765136 155.46631179 163.875 159.625 C165.67939414 163.43427651 165.09501562 167.00209061 164 171 C161.75410675 173.99452434 160.55130633 174.81623122 157 176 C155.44024881 176.09947413 153.87665187 176.14350139 152.31376648 176.15390015 C150.86914536 176.16680084 150.86914536 176.16680084 149.39533997 176.17996216 C148.34021713 176.18422211 147.2850943 176.18848206 146.19799805 176.19287109 C145.08553711 176.20104858 143.97307617 176.20922607 142.8269043 176.21765137 C139.13851461 176.2425029 135.45016337 176.2590196 131.76171875 176.2734375 C130.50321421 176.27876118 129.24470966 176.28408485 127.94806862 176.28956985 C122.65940906 176.31079697 117.37075527 176.32992729 112.08206463 176.34119225 C104.5099254 176.35742891 96.93829944 176.3906072 89.36635369 176.44759309 C83.39537731 176.49099426 77.42451524 176.50694035 71.45337868 176.51332474 C68.91562048 176.52004887 66.3778701 176.53530082 63.84021568 176.55921555 C60.28980701 176.59076918 56.74069714 176.59091792 53.19018555 176.58349609 C52.14113541 176.59990143 51.09208527 176.61630676 50.01124573 176.63320923 C45.40157823 176.59374052 42.05074243 176.56127426 38.3618927 173.60391235 C35.37556546 170.31158058 34.91720764 168.52249614 34.6875 164.22265625 C35.23528501 160.32653534 37.16101017 158.64092077 40 156 C42.39582346 154.80208827 43.86777538 154.8793256 46.54150391 154.88647461 C47.48232819 154.88655014 48.42315247 154.88662567 49.39248657 154.88670349 C50.41023163 154.89186478 51.42797668 154.89702606 52.4765625 154.90234375 C54.03713882 154.90446617 54.03713882 154.90446617 55.62924194 154.90663147 C58.96119021 154.91224134 62.29307195 154.92479553 65.625 154.9375 C67.88020736 154.94251373 70.13541578 154.94707686 72.390625 154.95117188 C77.92712975 154.96136426 83.46349017 154.9809378 89 155 C89 144.77 89 134.54 89 124 C83.555 123.505 83.555 123.505 78 123 C50.2450228 118.50606785 24.57550623 101.40169471 8 79 C-6.17032116 59.1639511 -18.46131918 31.97360396 -15 7 C-11.61041298 0.09160417 -7.24944534 -1.06833931 0 0 Z " fill="#FCFDFE" transform="translate(156,247)"/>
                                            </svg>\`;
                        micButton.title = 'Record voice';
                        micButton.classList.remove('n8n-recording');
                    }
                });

                // Handle speech recognition results
                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    let newFinalTranscript = '';

                    // Loop through results to separate interim and final transcripts
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            newFinalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    // Append new final transcript to the existing one
                    finalTranscript += newFinalTranscript;

                    // Update textarea with the accumulated final transcript and interim transcript
                    textarea.value = finalTranscript + interimTranscript;
                    textarea.scrollTop = textarea.scrollHeight; // Auto-scroll to the bottom
                    autoResizeTextarea(textarea); // Resize textarea after updating content
                };

                // Handle speech recognition errors
                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    micButton.classList.remove('n8n-recording');
                    isRecording = false;
                    textarea.value += \`\\n[Error: \${event.error}]\`;
                    autoResizeTextarea(textarea); // Resize after error message
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                };

                // Restart recognition on end to extend pause duration
                recognition.onend = () => {
                    // console.log('Speech recognition ended');
                    if (isRecording) {
                        // console.log('Restarting speech recognition to continue listening...');
                        try {
                            recognition.start();
                        } catch (error) {
                            console.error('Error restarting speech recognition:', error);
                            isRecording = false;
                            micButton.classList.remove('n8n-recording');
                        }
                    } else {
                        // Reset state when recognition is fully stopped
                        micButton.classList.remove('n8n-recording');
                        isRecording = false;
                    }
                };

                // Log when speech starts and ends for debugging
                recognition.onspeechstart = () => {
                    // console.log('Speech detected.');
                };

                recognition.onspeechend = () => {
                    // console.log('Speech paused (short pause detected).');
                };

                } else {
                    // Fallback for unsupported browsers
                    const micButton = document.querySelector('.n8n-chat-widget .n8n-mic-button');
                    micButton.disabled = true;
                    micButton.title = 'Speech recognition not supported in this browser';
                    console.warn('Speech recognition is not supported in this browser.');
                }
                    

                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                        // console.log('Close button clicked from inside iframe');
                        
                        // Send message to parent window to close the chat
                        window.parent.postMessage({
                            type: 'closeChat'
                        }, '*');
                });
            }

            let fullscreen = false;
            const fullscreenButton = document.querySelector('.n8n-fullscreen-button');
            if (fullscreenButton) {
                fullscreenButton.addEventListener('click', () => {
                    // Toggle fullscreen state
                    fullscreen = !fullscreen;
                    
                    // Send message to parent window
                    window.parent.postMessage({
                        type: 'fullscreenButton',
                        isFullscreen: fullscreen // Send the state to parent
                    }, '*');
                    
                    // Update button position based on state
                    fullscreenButton.style.right = fullscreen ? '47%' : '42%';
                });
            }



            refreshButton.addEventListener('click', () => {
                showConfirmationDialog();
            });

            // File preview remove functionality
            filePreviewContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('file-preview-remove')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    currentFiles.splice(index, 1);
                    renderFilePreviews();
                    updateButtonVisibility();
                }
            });



            let isResizing = false;

            resizeHandle.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                isResizing = true;
                
                // Convert to parent coordinates
                const iframeRect = window.frameElement.getBoundingClientRect();
                const parentX = e.clientX + iframeRect.left;
                const parentY = e.clientY + iframeRect.top;
                
                window.parent.postMessage({
                    type: 'startResize',
                    startX: parentX,
                    startY: parentY
                }, '*');
                
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'nwse-resize';
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;
                
                const iframeRect = window.frameElement.getBoundingClientRect();
                const parentX = e.clientX + iframeRect.left;
                const parentY = e.clientY + iframeRect.top;
                
                window.parent.postMessage({
                    type: 'resize',
                    clientX: parentX,
                    clientY: parentY
                }, '*');
            });

            document.addEventListener('mouseup', function() {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.userSelect = '';
                    document.body.style.cursor = '';
                    window.parent.postMessage({type: 'endResize'}, '*');
                }
            });


                // Listen for messages from parent
            window.addEventListener('message', (event) => {
                if (event.data.type === 'startConversation') {
                    if (!chatInitialized) {
                        initializeChat();
                        startNewConversation();
                    } else {
                        showChat();
                        // Don't call startNewConversation again for existing chat
                    }
                }
                
                if (event.data.type === 'closeChat') {
                    // console.log('Chat closed, but content preserved');
                    // Don't reset anything, just hide
                }
            });
                    
            </script>
        </body>
    </html>
    `;




// Create toggle button
const toggleButton = document.createElement('button');
toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
toggleButton.innerHTML =
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 70 70" preserveAspectRatio="xMidYMid meet">
        <path d="M0 0 C9.88869366 5.81586346 16.18371269 13.07946401 19.23828125 24.31640625 C20.38735482 37.08982869 18.61354015 47.16824221 10.296875 57.2734375 C3.21022892 64.30629499 -5.61611128 67.71862775 -15.51171875 67.69140625 C-26.47606606 67.63253223 -34.98655606 64.15103481 -42.76171875 56.31640625 C-50.24991451 46.1985229 -51.71146652 36.5669503 -50.76171875 24.31640625 C-48.94192176 16.08918036 -44.07411436 8.50798906 -37.296875 3.4921875 C-26.19180869 -3.40464315 -12.20554198 -5.88737907 0 0 Z " fill="#FEFEFE" transform="translate(50.76171875,2.68359375)"/>
        <path d="M0 0 C1.32 0 2.64 0 4 0 C4 2.31 4 4.62 4 7 C4.65226562 7.07476563 5.30453125 7.14953125 5.9765625 7.2265625 C12.62973359 8.22748204 15.80055993 9.69544413 20 15 C20 15.66 20 16.32 20 17 C21.32 17.66 22.64 18.32 24 19 C24 21.97 24 24.94 24 28 C23.195625 28.2475 22.39125 28.495 21.5625 28.75 C20.716875 29.1625 19.87125 29.575 19 30 C18.855625 30.61875 18.71125 31.2375 18.5625 31.875 C17.82539045 34.65963607 16.34991101 35.51720785 13.95703125 36.984375 C4.29230769 42 4.29230769 42 0 42 C0 40.35 0 38.7 0 37 C-0.515625 37.185625 -1.03125 37.37125 -1.5625 37.5625 C-5.06715697 38.19154099 -7.54853876 37.90827927 -11 37 C-13.625 34.1875 -13.625 34.1875 -16 31 C-16.928125 30.38125 -17.85625 29.7625 -18.8125 29.125 C-21.30086974 26.70772653 -21.35405417 26.18899169 -21.4375 22.875 C-21 19 -21 19 -19 17 C-18.01 17 -17.02 17 -16 17 C-15.773125 16.236875 -15.54625 15.47375 -15.3125 14.6875 C-13.66784972 11.31988277 -12.40460849 10.51315933 -9 9 C-6.67724823 8.59952556 -4.34260643 8.2602896 -2 8 C-1.01 7.67 -0.02 7.34 1 7 C0.34 5.02 -0.32 3.04 -1 1 C-0.67 0.67 -0.34 0.34 0 0 Z " fill="#CFD1D3" transform="translate(34,13)"/>
        <path d="M0 0 C1.58748047 -0.0299707 1.58748047 -0.0299707 3.20703125 -0.06054688 C4.72876953 -0.05958008 4.72876953 -0.05958008 6.28125 -0.05859375 C7.6744043 -0.06137329 7.6744043 -0.06137329 9.09570312 -0.06420898 C11.5 0.4375 11.5 0.4375 13.3034668 2.30029297 C14.82430072 5.01675494 14.86729985 6.90170081 14.8125 10 C14.80863281 10.95003906 14.80476563 11.90007813 14.80078125 12.87890625 C14.5 15.4375 14.5 15.4375 12.5 18.4375 C8.4951979 19.880311 4.26936741 19.62140746 0.0625 19.625 C-0.68837891 19.63724609 -1.43925781 19.64949219 -2.21289062 19.66210938 C-6.39120456 19.67313395 -9.74381715 19.50014376 -13.5 17.4375 C-14.85281371 14.73187257 -14.70609362 12.51856345 -14.75 9.5 C-14.77578125 8.43910156 -14.8015625 7.37820312 -14.828125 6.28515625 C-14.5 3.4375 -14.5 3.4375 -13.30566406 1.78662109 C-9.60321762 -0.97970111 -4.44163789 -0.02975519 0 0 Z " fill="#071942" transform="translate(35.5,26.5625)"/>
        <path d="M0 0 C1.61648437 0.04060547 1.61648437 0.04060547 3.265625 0.08203125 C4.08546875 0.11683594 4.9053125 0.15164062 5.75 0.1875 C5.75 1.5075 5.75 2.8275 5.75 4.1875 C4.90695313 4.30867188 4.06390625 4.42984375 3.1953125 4.5546875 C2.09960938 4.72226562 1.00390625 4.88984375 -0.125 5.0625 C-1.76082031 5.30613281 -1.76082031 5.30613281 -3.4296875 5.5546875 C-6.36932714 5.95006513 -6.36932714 5.95006513 -8.25 8.1875 C-8.49377883 11.54494112 -8.49377883 11.54494112 -8.375 15.3125 C-8.33375 17.58125 -8.2925 19.85 -8.25 22.1875 C-3.63 22.8475 0.99 23.5075 5.75 24.1875 C5.75 25.5075 5.75 26.8275 5.75 28.1875 C1.1102235 29.20598752 -2.63837828 29.44521501 -7.25 28.1875 C-9.875 25.375 -9.875 25.375 -12.25 22.1875 C-13.178125 21.56875 -14.10625 20.95 -15.0625 20.3125 C-17.55086974 17.89522653 -17.60405417 17.37649169 -17.6875 14.0625 C-17.25 10.1875 -17.25 10.1875 -15.25 8.1875 C-14.26 8.1875 -13.27 8.1875 -12.25 8.1875 C-12.0025 7.424375 -11.755 6.66125 -11.5 5.875 C-8.97012756 0.43577426 -5.73182886 -0.18690746 0 0 Z " fill="#E6E8EA" transform="translate(30.25,21.8125)"/>
        <path d="M0 0 C0 2.31 0 4.62 0 7 C0.66 7 1.32 7 2 7 C2 4.69 2 2.38 2 0 C2.99 0.33 3.98 0.66 5 1 C5.3125 3.6875 5.3125 3.6875 5 7 C2.6875 9.875 2.6875 9.875 0 12 C-0.99 12 -1.98 12 -3 12 C-4.52491998 8.95016004 -4.23562548 6.3576631 -4 3 C-1.77419355 0 -1.77419355 0 0 0 Z " fill="#122B5D" transform="translate(25,32)"/>
        <path d="M0 0 C0.66 0 1.32 0 2 0 C2 3.96 2 7.92 2 12 C0.68 11.34 -0.64 10.68 -2 10 C-2.1953125 3.9453125 -2.1953125 3.9453125 -2 2 C-1.34 1.34 -0.68 0.68 0 0 Z " fill="#46C2FC" transform="translate(15,30)"/>
        <path d="M0 0 C3.53571429 0.53571429 3.53571429 0.53571429 5 2 C5.04092937 4.33297433 5.04241723 6.66705225 5 9 C4.34 9 3.68 9 3 9 C2.67 7.02 2.34 5.04 2 3 C1.67 3 1.34 3 1 3 C0.67 4.98 0.34 6.96 0 9 C-0.66 9 -1.32 9 -2 9 C-2.125 5.625 -2.125 5.625 -2 2 C-1.34 1.34 -0.68 0.68 0 0 Z " fill="#35BAF7" transform="translate(42,30)"/>
        <path d="M0 0 C1.32 0 2.64 0 4 0 C3.95875 1.11375 3.9175 2.2275 3.875 3.375 C3.58878141 7.04366025 3.58878141 7.04366025 6 9 C3.36 9 0.72 9 -2 9 C-1.67 8.34 -1.34 7.68 -1 7 C-0.34 7 0.32 7 1 7 C0.34 5.02 -0.32 3.04 -1 1 C-0.67 0.67 -0.34 0.34 0 0 Z " fill="#3090DA" transform="translate(34,13)"/>
        <path d="M0 0 C2.475 0.99 2.475 0.99 5 2 C5 4.31 5 6.62 5 9 C4.34 9 3.68 9 3 9 C2.87625 8.030625 2.7525 7.06125 2.625 6.0625 C2.315625 4.5465625 2.315625 4.5465625 2 3 C1.34 2.67 0.68 2.34 0 2 C0 4.31 0 6.62 0 9 C-0.66 9 -1.32 9 -2 9 C-2.125 5.625 -2.125 5.625 -2 2 C-1.34 1.34 -0.68 0.68 0 0 Z " fill="#35BBF8" transform="translate(27,30)"/>
        <path d="M0 0 C1.98 0.99 1.98 0.99 4 2 C4 4.97 4 7.94 4 11 C3.01 11.33 2.02 11.66 1 12 C0.67 8.04 0.34 4.08 0 0 Z " fill="#3683E7" transform="translate(54,30)"/>
        <path d="M0 0 C-2.07143201 4.03384128 -3.96615872 5.92856799 -8 8 C-8.36075949 3.55063291 -8.36075949 3.55063291 -6.8125 1.1875 C-4.44017475 -0.36678206 -2.77958655 -0.22537188 0 0 Z " fill="#152E62" transform="translate(29,27)"/>
        <path d="M0 0 C0 2.64 0 5.28 0 8 C-1.98 8.99 -1.98 8.99 -4 10 C-4.36814024 3.49618902 -4.36814024 3.49618902 -2.5625 1.0625 C-1 0 -1 0 0 0 Z " fill="#06163E" transform="translate(25,32)"/>
        <path d="M0 0 C1.9453125 -0.29296875 1.9453125 -0.29296875 4.125 -0.1875 C5.40375 -0.125625 6.6825 -0.06375 8 0 C6.68 1.65 5.36 3.3 4 5 C2.02 4.34 0.04 3.68 -2 3 C-1.34 2.01 -0.68 1.02 0 0 Z " fill="#071B44" transform="translate(29,27)"/>
        <path d="M0 0 C1.32 0.33 2.64 0.66 4 1 C1.36 3.64 -1.28 6.28 -4 9 C-4.33 7.68 -4.66 6.36 -5 5 C-2.8125 2.1875 -2.8125 2.1875 0 0 Z " fill="#152E63" transform="translate(37,27)"/>
        <path d="M0 0 C-2.6860286 1.79068573 -4.6626589 2.66055791 -7.6875 3.625 C-8.49574219 3.88539062 -9.30398437 4.14578125 -10.13671875 4.4140625 C-10.75160156 4.60742188 -11.36648437 4.80078125 -12 5 C-12 3.68 -12 2.36 -12 1 C-7.9472484 0.01751476 -4.16138263 -0.08159574 0 0 Z " fill="#BEC5CB" transform="translate(46,50)"/>
        <path d="M0 0 C1.98 0 3.96 0 6 0 C5.6875 1.9375 5.6875 1.9375 5 4 C4.01 4.33 3.02 4.66 2 5 C1.01 4.01 0.02 3.02 -1 2 C-0.67 1.34 -0.34 0.68 0 0 Z " fill="#30A9E4" transform="translate(33,38)"/>
    </svg>
    
    <div class="n8n-chatbot-tail"></div>`;

// Dragging state variables
let isDragging = false;
let startX, startY, initialX, initialY;
let currentSide = 'right'; // Track current side

// Make toggle button draggable
function makeDraggable(element) {
    let startTime;
    
    // Mouse events
    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events for mobile
    element.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        startTime = Date.now();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        
        const rect = element.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        element.style.transition = 'none';
        element.style.cursor = 'grabbing';
        
        // Add dragging class for visual feedback
        element.classList.add('dragging');
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        let newX = initialX + deltaX;
        let newY = initialY + deltaY;
        
        // Constrain to viewport bounds
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    }
    
    function endDrag(e) {
        if (!isDragging) return;
        
        isDragging = false;
        element.style.cursor = 'pointer';
        element.classList.remove('dragging');
        
        const dragTime = Date.now() - startTime;
        const dragDistance = Math.sqrt(
            Math.pow(e.type.includes('touch') ? 
                (e.changedTouches[0].clientX - startX) : 
                (e.clientX - startX), 2) +
            Math.pow(e.type.includes('touch') ? 
                (e.changedTouches[0].clientY - startY) : 
                (e.clientY - startY), 2)
        );
        
        // If it was a quick click/tap with minimal movement, treat as toggle
        if (dragTime < 200 && dragDistance < 10) {
            handleToggleClick();
            return;
        }
        
        // Snap to side logic
        snapToSide();
    }
}

function snapToSide() {
    const rect = toggleButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const screenCenterX = window.innerWidth / 2;
    
    toggleButton.style.transition = 'all 0.3s ease-out';
    
    if (centerX < screenCenterX) {
        // Snap to left bottom position
        toggleButton.style.left = '20px';
        toggleButton.style.right = 'auto';
        toggleButton.style.bottom = '30px';
        toggleButton.style.top = 'auto';
        toggleButton.classList.add('position-left');
        currentSide = 'left';
    } else {
        // Snap to right bottom position
        toggleButton.style.right = '20px';
        toggleButton.style.left = 'auto';
        toggleButton.style.bottom = '30px';
        toggleButton.style.top = 'auto';
        toggleButton.classList.remove('position-left');
        currentSide = 'right';
    }
    
    // Reset transition after animation
    setTimeout(() => {
        toggleButton.style.transition = 'transform 0.3s';
    }, 300);
}

function handleToggleClick() {
    const wasOpen = chatIframe.classList.contains('open');
    chatIframe.classList.toggle('open');
    
    // Only start conversation if opening and not already initialized
    if (!wasOpen && chatIframe.classList.contains('open')) {
        toggleButton.style.display = 'none'; // Hide toggle button when chat is open
        // Ensure iframe is initialized before sending message
        if (!iframeInitialized) {
            setTimeout(() => {
                initializeIframe();
                setTimeout(() => {
                    sendMessageToIframe({type: 'startConversation'});
                    if (!chatInitialized) {
                        chatInitialized = true;
                    }
                }, 300);
            }, 50);
        } else {
            setTimeout(() => {
                sendMessageToIframe({type: 'startConversation'});
                if (!chatInitialized) {
                    chatInitialized = true;
                }
            }, 100);
        }
    }
}

// Initialize draggable functionality
makeDraggable(toggleButton);

// Handle window resize to reposition button if needed
window.addEventListener('resize', () => {
    // Reposition button on resize to maintain side preference at bottom
    setTimeout(() => {
        if (currentSide === 'left') {
            toggleButton.style.left = '20px';
            toggleButton.style.right = 'auto';
            toggleButton.style.bottom = '30px';
            toggleButton.style.top = 'auto';
        } else {
            toggleButton.style.right = '20px';
            toggleButton.style.left = 'auto';
            toggleButton.style.bottom = '30px';
            toggleButton.style.top = 'auto';
        }
    }, 100);
});

// Set initial position to bottom-right (or bottom-left based on config)
function setInitialPosition() {
    if (config.style.position === 'left') {
        toggleButton.style.left = '20px';
        toggleButton.style.right = 'auto';
        toggleButton.style.bottom = '30px';
        toggleButton.style.top = 'auto';
        currentSide = 'left';
    } else {
        toggleButton.style.right = '20px';
        toggleButton.style.left = 'auto';
        toggleButton.style.bottom = '30px';
        toggleButton.style.top = 'auto';
        currentSide = 'right';
    }
}

// Call initial positioning
setInitialPosition();

widgetContainer.appendChild(chatIframe);
widgetContainer.appendChild(toggleButton);
document.body.appendChild(widgetContainer);

// Initialize iframe content only once
function initializeIframe() {
    if (!iframeInitialized) {
        const iframeDoc = chatIframe.contentDocument || chatIframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(iframeContent);
        iframeDoc.close();
        iframeInitialized = true;
        
        // Wait for iframe to be fully loaded before marking as ready
        chatIframe.onload = () => {
            toggleButton.style.display = ''; // Show toggle button when iframe is ready
        };
    }
}

// Function to safely send message to iframe
function sendMessageToIframe(message, retries = 3) {
    if (chatIframe.contentWindow && iframeInitialized) {
        try {
            chatIframe.contentWindow.postMessage(message, '*');
        } catch (error) {
            console.error('Error sending message to iframe:', error);
            if (retries > 0) {
                setTimeout(() => {
                    sendMessageToIframe(message, retries - 1);
                }, 200);
            }
        }
    } else if (retries > 0) {
        setTimeout(() => {
            sendMessageToIframe(message, retries - 1);
        }, 200);
    }
}

// Listen for messages from iframe (including close button clicks)
window.addEventListener('message', (event) => {
    if (event.data.type === 'closeChat') {
        chatIframe.classList.remove('open');
        toggleButton.style.display = ''; // Show toggle button again
    }
});





// Global state variables
let isFullscreen = false;
let originalStyles = {};
let overlay = null;
let fullscreenButton = null; 



// Listen for messages from iframe (including close button clicks)
window.addEventListener('message', (event) => {
    if (event.data.type === 'fullscreenButton') {
        // console.log('Received fullscreenButton message from iframe');
        // console.log('Current fullscreen state:', isFullscreen);
        
        // Try multiple ways to find the iframe
        let iframe = window.chatIframeRef || 
                    document.getElementById('chat-iframe') || 
                    document.querySelector('.chat-iframe') ||
                    document.querySelector('iframe[src*="data:text/html"]') ||
                    document.querySelector('iframe');


        

        // Make sure we have the fullscreen button reference
        if (!fullscreenButton) {
            fullscreenButton = document.getElementById('fullscreen-btn') || 
                              document.querySelector('.n8n-fullscreen-button') ||
                              document.querySelector('[title="Toggle Fullscreen"]');
        }

        

        // console.log('Toggling fullscreen mode. Will be:', !isFullscreen);
        // console.log('iframe element:', iframe);

        if (!isFullscreen) {
            // ENTER FULLSCREEN MODE
            // console.log('Entering fullscreen mode');
            
            // Save original styles before changing them
            originalStyles = {
                width: iframe.style.width || '350px',
                height: iframe.style.height || '500px',
                left: iframe.style.left || '',
                top: iframe.style.top || '',
                right: iframe.style.right || '20px',
                bottom: iframe.style.bottom || '20px',
                position: iframe.style.position || 'fixed',
                borderRadius: iframe.style.borderRadius || '20px',
                boxShadow: iframe.style.boxShadow || '0 8px 32px rgba(133, 79, 255, 0.15)',
                zIndex: iframe.style.zIndex || 'auto'
            };

            // Apply full-screen styles to the iframe element
            iframe.style.width = '100vw';
            iframe.style.height = '100vh';
            iframe.style.left = '0';
            iframe.style.top = '0';
            iframe.style.right = 'auto';
            iframe.style.bottom = 'auto';
            iframe.style.position = 'fixed';
            iframe.style.borderRadius = '20px'; // Keep border radius in fullscreen
            iframe.style.boxShadow = 'none';
            iframe.style.zIndex = '9999';

            // Add fullscreen class
            iframe.classList.add('chat-iframe-fullscreen');
            
            // Create and add overlay (optional background)
            overlay = document.createElement('div');
            overlay.className = 'fullscreen-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                // background: rgba(0, 0, 0, 0.8);
                z-index: 9998;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            // console.log('Fullscreen overlay added');
            // console.log('Original iframe styles saved:', fullscreenButton);
            
            // Update button icon to "minimize" if button exists
            if (fullscreenButton) {
                fullscreenButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;
                fullscreenButton.title = 'Exit Fullscreen';
                fullscreenButton.style.right = '47%';
            }
            
            // Update state
            isFullscreen = true;
        }
        else {
            // EXIT FULLSCREEN MODE
            // console.log('Exiting fullscreen mode');
            // console.log('Original iframe styles to restore:', originalStyles);
            // Restore original styles
            iframe.style.width = originalStyles.width;
            iframe.style.height = originalStyles.height;
            iframe.style.left = originalStyles.left;
            iframe.style.top = originalStyles.top;
            iframe.style.right = originalStyles.right;
            iframe.style.bottom = originalStyles.bottom;
            iframe.style.position = originalStyles.position;
            iframe.style.borderRadius = originalStyles.borderRadius;
            iframe.style.boxShadow = originalStyles.boxShadow;
            iframe.style.zIndex = '9999'; // Ensure it's above overlay during transition

            // Remove fullscreen class
            iframe.classList.remove('chat-iframe-fullscreen');
            
            // Remove overlay if it exists
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                overlay = null;
            }
            
            // Restore body scroll
            document.body.style.overflow = '';

            // Restore fullscreen button icon if button exists
            if (fullscreenButton) {
                fullscreenButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
                fullscreenButton.title = 'Enter Fullscreen';
                fullscreenButton.style.right = '42%';
            }
            
            // Update state
            isFullscreen = false;
        }
        
        // console.log('Fullscreen state after toggle:', isFullscreen);
    }
});




// toggleButton.addEventListener('click', () => {
//     chatContainer.classList.toggle('n8n-open');
    
//     if (chatContainer.classList.contains('n8n-open') && !currentSessionId) {
//         startNewConversation();
//     }
// });


        





// PARENT SCRIPT - Simplified and optimized for smoothness

let isResizing = false;
let  startWidth, startHeight, startLeft, startTop;
let currentClientX = 0, currentClientY = 0;

const MIN_WIDTH = 300;
const MIN_HEIGHT = 350;
const WINDOW_PADDING = 20;

// Optimized resize function without RAF wrapping
function performResize(clientX, clientY) {
    const dx = clientX - startX;
    const dy = clientY - startY;
   
    let newWidth = Math.max(MIN_WIDTH, startWidth - dx);
    let newHeight = Math.max(MIN_HEIGHT, startHeight - dy);
   
    let newLeft = startLeft + (startWidth - newWidth);
    let newTop = startTop + (startHeight - newHeight);
   
    // Boundary calculations
    const maxWidth = window.innerWidth - WINDOW_PADDING;
    const maxHeight = window.innerHeight - WINDOW_PADDING;
   
    newLeft = Math.max(WINDOW_PADDING, newLeft);
    newTop = Math.max(WINDOW_PADDING, newTop);
   
    if (newLeft + newWidth > maxWidth) {
        newWidth = maxWidth - newLeft;
        newWidth = Math.max(MIN_WIDTH, newWidth);
    }
   
    if (newTop + newHeight > maxHeight) {
        newHeight = maxHeight - newTop;
        newHeight = Math.max(MIN_HEIGHT, newHeight);
    }
   
    // Apply styles immediately - no RAF wrapping
    chatIframe.style.width = `${newWidth}px`;
    chatIframe.style.height = `${newHeight}px`;
    chatIframe.style.left = `${newLeft}px`;
    chatIframe.style.top = `${newTop}px`;
    chatIframe.style.right = 'auto';
    chatIframe.style.bottom = 'auto';
    chatIframe.style.position = 'fixed';
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'closeChat') {
        chatIframe.classList.remove('open');
        
    } else if (event.data.type === 'startResize') {
        isResizing = true;
        startX = event.data.startX;
        startY = event.data.startY;
        
        // Get initial dimensions
        const rect = chatIframe.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = rect.left;
        startTop = rect.top;
        
        document.body.style.userSelect = 'none';
        
    } else if (event.data.type === 'resize' && isResizing) {
        // Perform resize immediately when message is received
        currentClientX = event.data.clientX;
        currentClientY = event.data.clientY;
        performResize(currentClientX, currentClientY);
        
    } else if (event.data.type === 'endResize') {
        isResizing = false;
        document.body.style.userSelect = '';
    }
});

// Handle cases where mouse goes outside iframe during resize
// Use direct event handling for parent window
document.addEventListener('mousemove', function(e) {
    if (isResizing) {
        currentClientX = e.clientX;
        currentClientY = e.clientY;
        performResize(currentClientX, currentClientY);
    }
});

document.addEventListener('mouseup', function() {
    if (isResizing) {
        isResizing = false;
        document.body.style.userSelect = '';
    }
});


})();
