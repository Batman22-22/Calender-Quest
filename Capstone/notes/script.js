document.getElementById('save-button').addEventListener('click', function() {
    const noteInput = document.getElementById('note-input');
    const notesContainer = document.getElementById('notes-container');
    
    if (noteInput.value.trim() !== '') {
        const note = document.createElement('div');
        note.className = 'note';

        const noteText = document.createElement('span');
        noteText.textContent = noteInput.value;

        const removeIcon = document.createElement('i');
        removeIcon.className = 'fas fa-trash-alt remove-icon';
        removeIcon.addEventListener('click', function() {
            notesContainer.removeChild(note);
        });

        note.appendChild(noteText);
        note.appendChild(removeIcon);
        notesContainer.appendChild(note);
        noteInput.value = '';
    } else {
        alert('Please enter a note before saving.');
    }
});

