// Smooth scrolling into view when clicking on links in the docs page

const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition - headerOffset;
  
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
  
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const href = a.getAttribute("href");
        scrollToElement(href.substring(1));
    });
  });