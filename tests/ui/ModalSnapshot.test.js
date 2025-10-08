import { showChoiceModal } from '../../js/ui.js';

describe('Modal UI Snapshot', () => {
    let originalAppendChild;
    let originalRemoveChild;

    beforeAll(() => {
        // Mock appendChild and removeChild to prevent actual DOM manipulation during tests
        originalAppendChild = document.body.appendChild;
        originalRemoveChild = document.body.removeChild;
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
    });

    afterAll(() => {
        // Restore original functions
        document.body.appendChild = originalAppendChild;
        document.body.removeChild = originalRemoveChild;
    });

    beforeEach(() => {
        // Clear any existing modal content before each test
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('should render the choice modal correctly when shown', async () => {
        const title = 'Test Modal Title';
        const message = 'This is a test modal message.'; // showChoiceModal doesn't use message directly
        const choices = [
            'Option A', 
            'Option B',
        ];

        // showChoiceModal returns a Promise, so we need to await it or handle it.
        // For snapshot testing, we just need it to render, not resolve.
        const modalPromise = showChoiceModal(title, choices);

        // The modal content is appended to document.body, so we snapshot the body
        expect(document.body.innerHTML).toMatchSnapshot();

        // Clean up the modal after snapshotting
        const overlay = document.getElementById('choice-modal-overlay');
        if (overlay) {
            overlay.remove();
        }

        // To prevent unhandled promise rejection warning, we can catch the promise
        modalPromise.catch(() => {});
    });
});
