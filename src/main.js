import App from './App.svelte';
import Home from './pages/Home.svelte'; 
import Gokomyo from './pages/Gokomyo.svelte';
import Gomizunoo from './pages/Gomizunoo.svelte';
import Gomomozono from './pages/Gomizunoo.svelte';
import Gosai from './pages/Gomizunoo.svelte';
import Gosakuramachi from './pages/Gomizunoo.svelte';
import Goyozei from './pages/Gomizunoo.svelte';
import Higashiyama from './pages/Gomizunoo.svelte';
import Kokaku from './pages/Gomizunoo.svelte';
import Komei from './pages/Gomizunoo.svelte';
import Meisho from './pages/Gomizunoo.svelte';
import Momozono from './pages/Gomizunoo.svelte';
import Niko from './pages/Gomizunoo.svelte';
import Reigen from './pages/Gomizunoo.svelte';
import Sakuramachi from './pages/Gomizunoo.svelte';

export {
	Home,
	Gokomyo,
	Gomizunoo,
	Gomomozono,
	Gosai,
	Gosakuramachi,
	Goyozei,
	Higashiyama,
	Kokaku,
	Komei,
	Meisho,
	Momozono,
	Niko,
	Reigen,
	Sakuramachi
};

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;