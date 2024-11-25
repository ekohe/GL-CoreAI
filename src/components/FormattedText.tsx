import React from 'react';

interface FormattedTextProps {
  text: string;
}

function formatTextWithLinks(text: string): JSX.Element[] {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+(?:\.[^\s]+)?(?:\/[^\s]*)?)/g;

  // Split the text into sentences
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  // Process each sentence
  return sentences.map((sentence, index) => {
    // Check if the sentence contains a URL
    const urlMatch = sentence.match(urlRegex);
    if (urlMatch) {
      // Extract the URL
      // const url = urlMatch[0];
      const url = urlMatch[0].replace(/[.,;!?]+$/, ''); // Remove trailing punctuation

      // Split the sentence at the URL
      const [beforeUrl, afterUrl] = sentence.split(url);
      return (
        <li key={index}>
          {beforeUrl}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
          {afterUrl}
        </li>
      );
    } else {
      // If no URL, return the sentence as a paragraph
      return <li key={index}>{sentence.trim()}</li>;
    }
  });
}

const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  return <ul
          style={{
            fontSize: '1.1rem',
            marginTop: '10px'
          }}>
    {formatTextWithLinks(text)}
  </ul>;
};

export default FormattedText;
