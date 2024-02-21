import React from 'react';
import ReactMde from 'react-mde';
import Showdown from 'showdown';

export default function Editor({ currentNote, updateNote }) {
  const [selectedTab, setSelectedTab] = React.useState('write');

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
  });

  return (
    <section className="pane editor">
      <ReactMde
        value={currentNote?.body} // Optional chaining just in case currentNote doesn't exist. We take off the conditional rendering from App component
        onChange={updateNote}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) => Promise.resolve(converter.makeHtml(markdown))}
        minEditorHeight={80}
        heightUnits="vh"
      />
    </section>
  );
}
