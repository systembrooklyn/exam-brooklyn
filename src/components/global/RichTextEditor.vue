<template>
  <div v-if="editor" class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      <button
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :class="[
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
          editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
        ]"
        title="Bold"
      >
        <Bold :size="18" />
      </button>
      
      <button
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="[
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
          editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
        ]"
        title="Italic"
      >
        <Italic :size="18" />
      </button>
      
      <button
        type="button"
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="[
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
          editor.isActive('underline') ? 'bg-gray-300 dark:bg-gray-600' : ''
        ]"
        title="Underline"
      >
        <UnderlineIcon :size="18" />
      </button>
      
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      
      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="[
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
          editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''
        ]"
        title="Bullet List"
      >
        <List :size="18" />
      </button>
      
      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="[
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
          editor.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-600' : ''
        ]"
        title="Numbered List"
      >
        <ListOrdered :size="18" />
      </button>
      
      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      
      <button
        type="button"
        @click="setLink"
        :class="[
          'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
          editor.isActive('link') ? 'bg-gray-300 dark:bg-gray-600' : ''
        ]"
        title="Add Link"
      >
        <LinkIcon :size="18" />
      </button>
      
      <button
        type="button"
        @click="editor.chain().focus().unsetLink().run()"
        :disabled="!editor.isActive('link')"
        class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove Link"
      >
        <Unlink :size="18" />
      </button>
    </div>
    
    <!-- Editor Content -->
    <EditorContent 
      :editor="editor" 
      class="prose prose-sm max-w-none p-4 min-h-[300px] text-gray-900 dark:text-gray-100 focus:outline-none"
    />
  </div>
  <div v-else class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
    <p class="text-gray-500 dark:text-gray-400">Loading editor...</p>
  </div>
  
  <!-- Link Modal -->
  <LinkModal
    :show="showLinkModal"
    :initial-url="currentLinkUrl"
    @close="showLinkModal = false"
    @submit="handleLinkSubmit"
  />
</template>

<script setup>
import { ref } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { watch, onBeforeUnmount } from 'vue';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon, Unlink } from 'lucide-vue-next';
import LinkModal from './LinkModal.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Write your email content here...'
  }
});

const emit = defineEmits(['update:modelValue']);

const showLinkModal = ref(false);
const currentLinkUrl = ref('');

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline'
      }
    }),
    Underline
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  }
});

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue, false);
  }
});

const setLink = () => {
  if (!editor.value) return;
  
  const previousUrl = editor.value.getAttributes('link').href;
  currentLinkUrl.value = previousUrl || '';
  showLinkModal.value = true;
};

const handleLinkSubmit = (url) => {
  if (!editor.value) return;
  
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
  } else {
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }
  
  showLinkModal.value = false;
};

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style>
/* TipTap Editor Styles */
.ProseMirror {
  outline: none;
}

.ProseMirror p {
  margin: 0.5em 0;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.ProseMirror a {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}

.ProseMirror strong {
  font-weight: bold;
}

.ProseMirror em {
  font-style: italic;
}

.ProseMirror u {
  text-decoration: underline;
}
</style>
