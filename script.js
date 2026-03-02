// Get DOM elements
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const spinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');

// Main search function
async function searchCountry(countryName) {
    // Clear previous messages and content
    errorMessage.textContent = '';
    countryInfo.innerHTML = '';
    borderingCountries.innerHTML = '';

    if (!countryName) {
        errorMessage.textContent = "Please enter a country name.";
        return;
    }

    try {
        // Show loading spinner
        spinner.classList.remove('hidden');

        // Fetch country data with fullText=true
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        if (!response.ok) throw new Error("Country not found");

        const data = await response.json();

        // Find exact match for common name
        const country = data.find(c => c.name.common.toLowerCase() === countryName.toLowerCase());
        if (!country) throw new Error("Country not found");

        // Update country info
        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Official Name:</strong> ${country.name.official}</p>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
        `;

        // Update bordering countries
        if (country.borders && country.borders.length > 0) {
            // Fetch all borders in one request
            const borderCodes = country.borders.join(",");
            const bordersRes = await fetch(`https://restcountries.com/v3.1/alpha?codes=${borderCodes}`);
            const bordersData = await bordersRes.json();

            borderingCountries.innerHTML = ''; // clear previous borders
            bordersData.forEach(borderCountry => {
                borderingCountries.innerHTML += `
                    <div class="border-card">
                        <p>${borderCountry.name.common}</p>
                        <img src="${borderCountry.flags.svg}" alt="${borderCountry.name.common} flag">
                    </div>
                `;
            });
        } else {
            borderingCountries.innerHTML = "<p>No bordering countries.</p>";
        }

    } catch (error) {
        // Show user-friendly error
        errorMessage.textContent = `Error: ${error.message}`;
    } finally {
        // Hide spinner
        spinner.classList.add('hidden');
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const country = countryInput.value.trim();
    searchCountry(country);
});

// Trigger search on Enter key
countryInput.addEventListener('keyup', (event) => {
    if (event.key === "Enter") {
        const country = countryInput.value.trim();
        searchCountry(country);
    }
});