# React Frontend

First things first run `npm run dev` from the **frontend/** directory

Okay if you haven't used react before this looks so intimidating but it's not
complicated:

You will probably do everything inside of the src/ folder.

Make sure you have some JSX/TSX linter or something

## Architecture

So essentially, you just write javascript functions that return html code.
You can also add in CSS in the .css files.

In App.tsx, there is the main function that returns the main page html. That
HTML is literally the website:

```tsx
import './App.css'

function App() {
  return (
    <div>
      <p className="header">
        I strongly dislike frontend development
      </p>
    </div>
  )
}

export default App
```

You can write custom HTML components by writing different
functions (in different files if you'd like) and
then use them in your HTML as tags (must be capitalized):

For example, I define a XanderButton:

```tsx
function XanderButton(button_text: string) {
  return (
    <button>
      {button_text}
    </button>
  )
}

// This is to make the component visible to other files
export default XanderButton
```

Then I can use it in App:

```tsx
function App() {
  return (
    <div>
      <p className="header">
        I strongly dislike frontend development
      </p>
      <XanderButton button_text="Hello" />
    </div>
  )
}
```

If the defined component function has an object parameter with a children
key, then you can also do something like this

```tsx
// App.tsx
function XanderButton({ children }) {
  /* ... */
}

function App() {
/* ... */
  // Note that I put the text parameter within the two component tags
    <XanderButton>
      Hello
    </XanderButton>
/* ... */
}

```

You can route to other pages by having an element with the Routes
and Route components:

> Note, you should probably put all of the components in separate files
in the src/components directory, but I didn't to make it simpler. You just
have to `import { *component* } from './components/*filename*`

```tsx
import './App.css'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}

function XanderButton({ children }: { children: string }) {
  return (
    <button>
      {children}
    </button>
  )
}

function Home() {
  return (
    <div>
      <p>
        I strongly dislike frontend development
      </p>
      <XanderButton>Yay</XanderButton>
    </div>
  )
}

export default App
```

## Running the server

Run `npm run dev` from the frontent directory
