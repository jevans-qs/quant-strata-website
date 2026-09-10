document.querySelectorAll('[data-b64-download]').forEach(button => {
  button.addEventListener('click', async () => {
    const url = button.dataset.b64Download;
    const filename = button.dataset.filename || 'Quant_Strata_Executive_Case_Study.pdf';
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Preparing Download...';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download source unavailable');
      const encoded = (await response.text()).trim();
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch (error) {
      window.location.href = '../../contact/';
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });
});
