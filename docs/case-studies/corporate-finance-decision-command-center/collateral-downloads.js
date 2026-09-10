const COLLATERAL_DOWNLOADS = {
  onePager: {
    href: './downloads/Quant_Strata_CF_Command_Center_Sales_One_Pager.pdf',
    filename: 'Quant_Strata_CF_Command_Center_Sales_One_Pager.pdf',
    encoded: false
  },
  cfoBrief: {
    href: './downloads/Quant_Strata_CF_Command_Center_CFO_Decision_Brief.pdf',
    filename: 'Quant_Strata_CF_Command_Center_CFO_Decision_Brief.pdf',
    encoded: false
  },
  caseStudy: {
    href: './downloads/Quant_Strata_CF_Command_Center_Executive_Case_Study.pdf.b64',
    filename: 'Quant_Strata_CF_Command_Center_Executive_Case_Study.pdf',
    encoded: true
  }
};

async function downloadEncodedPdf(asset) {
  const response = await fetch(asset.href);
  if (!response.ok) throw new Error('Unable to retrieve collateral');
  const encoded = (await response.text()).trim();
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = asset.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

document.querySelectorAll('[data-download]').forEach(button => {
  button.addEventListener('click', async () => {
    const asset = COLLATERAL_DOWNLOADS[button.dataset.download];
    if (!asset) return;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Preparing Download...';
    try {
      if (asset.encoded) {
        await downloadEncodedPdf(asset);
      } else {
        const link = document.createElement('a');
        link.href = asset.href;
        link.download = asset.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      window.location.href = '../../contact/';
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  });
});
